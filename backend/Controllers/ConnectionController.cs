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
        private readonly TenantDbContext _tenantDb;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public ConnectionController(TenantDbContext tenantDb, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _tenantDb = tenantDb;
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
            // Verify the agent exists in the current tenant's schema
            var agent = await _tenantDb.Agents.Include(a => a.Persona).FirstOrDefaultAsync(a => a.Id == request.AgentId);
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
                ai_provider = agent.Persona?.Provider ?? "google",
                system_prompt = agent.Persona?.SystemPrompt ?? "You are a helpful assistant.",
                metadata = request.Metadata
            };

            var httpClient = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(workerPayload), Encoding.UTF8, "application/json");
            
            var workerUrl = _configuration["GO_AGENT_URL"] ?? "http://127.0.0.1:8080";
            var workerEndpoint = $"{workerUrl.TrimEnd('/')}/worker/join";
            try 
            {
                var response = await httpClient.PostAsync(workerEndpoint, content);
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

        [HttpPost("observer-token")]
        public ActionResult<CreateTokenResponseDto> CreateObserverToken([FromBody] CreateTransferTokenRequestDto request)
        {
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
                { "video", new Dictionary<string, object> { 
                    { "roomJoin", true }, 
                    { "room", request.RoomId },
                    { "canPublish", false }, // Listen-only
                    { "canSubscribe", true },
                    { "hidden", true } // Hide from other participants
                }}
            };

            var payload = new JwtPayload(livekitApiKey, null, null, DateTime.UtcNow, DateTime.UtcNow.AddHours(2));
            foreach (var claim in claims) {
                payload[claim.Key] = claim.Value;
            }

            var token = new JwtSecurityToken(new JwtHeader(credentials), payload);
            return Ok(new CreateTokenResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                RoomName = request.RoomId,
                LiveKitUrl = livekitUrl
            });
        }

        [HttpPost("takeover")]
        public async Task<ActionResult<CreateTokenResponseDto>> TakeoverSession([FromBody] CreateTransferTokenRequestDto request)
        {
            var callRecord = await _tenantDb.CallRecords.FirstOrDefaultAsync(c => c.RoomName == request.RoomId);
            if (callRecord == null) return NotFound("Call not found");

            callRecord.SupervisorTakeoverAt = DateTime.UtcNow;
            await _tenantDb.SaveChangesAsync();

            // Wake up Golang Worker to shutdown AI gracefully
            var workerUrl = _configuration["GO_AGENT_URL"] ?? "http://127.0.0.1:8080";
            var workerEndpoint = $"{workerUrl.TrimEnd('/')}/worker/takeover";
            var httpClient = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(new { room_name = request.RoomId }), Encoding.UTF8, "application/json");
            
            try 
            {
                await httpClient.PostAsync(workerEndpoint, content);
                // We ignore failure here to ensure supervisor still gets the token even if AI doesn't close cleanly
            }
            catch (Exception) {}

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
                { "video", new Dictionary<string, object> { 
                    { "roomJoin", true }, 
                    { "room", request.RoomId },
                    { "canPublish", true },
                    { "canSubscribe", true }
                }}
            };

            var payload = new JwtPayload(livekitApiKey, null, null, DateTime.UtcNow, DateTime.UtcNow.AddHours(2));
            foreach (var claim in claims) {
                payload[claim.Key] = claim.Value;
            }

            var token = new JwtSecurityToken(new JwtHeader(credentials), payload);
            return Ok(new CreateTokenResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                RoomName = request.RoomId,
                LiveKitUrl = livekitUrl
            });
        }
    }
}
