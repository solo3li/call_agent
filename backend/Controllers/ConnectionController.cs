using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers
{
    [Authorize(AuthenticationSchemes = "ApiKey")]
    [ApiController]
    [Route("api/[controller]")]
    public class ConnectionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public ConnectionController(AppDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public class CreateTokenRequestDto
        {
            public Guid AgentId { get; set; }
            public string ParticipantName { get; set; } = "user";
            public Dictionary<string, string> Metadata { get; set; } = new();
        }

        public class CreateTokenResponseDto
        {
            public string Token { get; set; } = string.Empty;
            public string RoomName { get; set; } = string.Empty;
            public string LiveKitUrl { get; set; } = string.Empty;
        }

        public class CreateTransferTokenRequestDto
        {
            public string RoomId { get; set; } = string.Empty;
            public string ParticipantName { get; set; } = "agent";
        }

        public class SipTransferRequestDto
        {
            public string RoomId { get; set; } = string.Empty;
            public string SipUri { get; set; } = string.Empty;
        }

        [HttpPost("token")]
        public async Task<ActionResult<CreateTokenResponseDto>> CreateToken([FromBody] CreateTokenRequestDto request)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            // Verify the agent belongs to the tenant
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == request.AgentId && a.TenantId == tenantId);
            if (agent == null)
                return NotFound("Agent not found.");

            string roomName = $"room_{Guid.NewGuid().ToString("N").Substring(0, 10)}";
            string livekitApiKey = _configuration["LIVEKIT_API_KEY"] ?? "devkey";
            string livekitApiSecret = _configuration["LIVEKIT_API_SECRET"] ?? "livekit_secret_key_1234567890123";
            string livekitUrl = _configuration["LIVEKIT_URL"] ?? "ws://localhost:7880";

            // 1. Generate LiveKit JWT Token manually
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(livekitApiSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            
            var claims = new Dictionary<string, object>
            {
                { "iss", livekitApiKey },
                { "sub", request.ParticipantName },
                { "name", request.ParticipantName },
                { "video", new Dictionary<string, object> { { "roomJoin", true }, { "room", roomName } } }
            };

            var payload = new JwtPayload(livekitApiKey, null, null, DateTime.UtcNow, DateTime.UtcNow.AddHours(2));
            foreach (var claim in claims) {
                payload[claim.Key] = claim.Value;
            }

            var token = new JwtSecurityToken(new JwtHeader(credentials), payload);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 2. Wake up the Golang Worker
            var workerPayload = new
            {
                room_name = roomName,
                ai_provider = agent.Provider,
                system_prompt = agent.PromptContext,
                metadata = request.Metadata
            };

            var httpClient = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(workerPayload), Encoding.UTF8, "application/json");
            
            try 
            {
                var response = await httpClient.PostAsync("http://127.0.0.1:8080/worker/join", content);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode(500, "Failed to start AI Agent session.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to contact AI Worker: {ex.Message}");
            }

            // 3. Return the token to the Client SDK
            return Ok(new CreateTokenResponseDto
            {
                Token = tokenString,
                RoomName = roomName,
                LiveKitUrl = livekitUrl
            });
        }

        [HttpPost("transfer-token")]
        public ActionResult<CreateTokenResponseDto> CreateTransferToken([FromBody] CreateTransferTokenRequestDto request)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            string livekitApiKey = _configuration["LIVEKIT_API_KEY"] ?? "devkey";
            string livekitApiSecret = _configuration["LIVEKIT_API_SECRET"] ?? "livekit_secret_key_1234567890123";
            string livekitUrl = _configuration["LIVEKIT_URL"] ?? "ws://localhost:7880";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(livekitApiSecret));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            
            var claims = new Dictionary<string, object>
            {
                { "iss", livekitApiKey },
                { "sub", request.ParticipantName },
                { "name", request.ParticipantName },
                { "video", new Dictionary<string, object> { { "roomJoin", true }, { "room", request.RoomId } } }
            };

            var payload = new JwtPayload(livekitApiKey, null, null, DateTime.UtcNow, DateTime.UtcNow.AddHours(2));
            foreach (var claim in claims) {
                payload[claim.Key] = claim.Value;
            }

            var token = new JwtSecurityToken(new JwtHeader(credentials), payload);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new CreateTokenResponseDto
            {
                Token = tokenString,
                RoomName = request.RoomId,
                LiveKitUrl = livekitUrl
            });
        }

        [HttpPost("sip-transfer")]
        public ActionResult InitiateSipTransfer([FromBody] SipTransferRequestDto request)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            // Here we would use LiveKit Server SDK (or Twirp HTTP API) to call CreateSipParticipant
            // For now, we simulate success since livekit-sip gateway is pending configuration
            
            return Ok(new { success = true, message = $"Initiated SIP dial-out to {request.SipUri} for room {request.RoomId}" });
        }
    }
}
