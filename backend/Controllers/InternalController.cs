using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Text.Json;
using System.Text;

namespace backend.Controllers
{
    /// <summary>
    /// Internal endpoints used by FreeSWITCH, Go Agent, and OpenSIPS
    /// These endpoints are NOT exposed to external clients.
    /// Authentication: X-Internal-Key header (shared secret between services)
    /// </summary>
    [ApiController]
    [Route("api/internal")]
    public class InternalController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<InternalController> _logger;

        public InternalController(
            AppDbContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<InternalController> logger)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // ─────────────────────────────────────────────────────────────────
        // Middleware: Verify internal service key
        // ─────────────────────────────────────────────────────────────────
        private bool IsInternalRequest()
        {
            var expectedKey = _configuration["INTERNAL_API_KEY"];
            var providedKey = Request.Headers["X-Internal-Key"].FirstOrDefault();
            return !string.IsNullOrEmpty(expectedKey) && expectedKey == providedKey;
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/internal/phone-config/{number}
        // Called by FreeSWITCH dialplan (mod_curl) when a call arrives
        // Returns: tenant + agent configuration for this phone number
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("phone-config/{number}")]
        public async Task<ActionResult<PhoneConfigDto>> GetPhoneConfig(string number)
        {
            if (!IsInternalRequest())
                return Unauthorized(new { error = "Invalid internal key" });

            // Normalize number (strip leading + or spaces)
            var normalized = number.TrimStart('+').Trim();

            _logger.LogInformation("PhoneConfig: Looking up number {Number}", normalized);

            // Find phone number → agent → tenant chain
            var phoneNumber = await _context.PhoneNumbers
                .Include(p => p.Tenant)
                .Include(p => p.AiAgent)
                .FirstOrDefaultAsync(p =>
                    p.Number == normalized ||
                    p.Number == "+" + normalized ||
                    p.Number.Replace("+", "").Replace(" ", "") == normalized);

            if (phoneNumber == null || phoneNumber.AiAgent == null)
            {
                _logger.LogWarning("PhoneConfig: Number {Number} not found", normalized);
                return NotFound(new { error = "number_not_configured", number = normalized });
            }

            var webhooks = await _context.Webhooks
                .Where(w => w.TenantId == phoneNumber.TenantId)
                .ToListAsync();

            _logger.LogInformation("PhoneConfig: Found agent {AgentId} for tenant {TenantId}",
                phoneNumber.AiAgent.Id, phoneNumber.TenantId);

            return Ok(new PhoneConfigDto
            {
                TenantId = phoneNumber.TenantId.ToString(),
                AgentId = phoneNumber.AiAgent.Id.ToString(),
                Provider = phoneNumber.AiAgent.Provider,
                Prompt = phoneNumber.AiAgent.PromptContext,
                WelcomeMessage = phoneNumber.AiAgent.WelcomeMessage,
                VoiceId = phoneNumber.AiAgent.VoiceId,
                ModelName = phoneNumber.AiAgent.ModelName,
                WebhookUrls = webhooks.Select(w => w.Url).ToList()
            });
        }

        // ─────────────────────────────────────────────────────────────────
        // POST /api/internal/agent-join
        // Called by FreeSWITCH after fetching config, to trigger Go Agent
        // Returns: confirmation that agent session was started
        // ─────────────────────────────────────────────────────────────────
        [HttpPost("agent-join")]
        public async Task<ActionResult> AgentJoin([FromBody] AgentJoinDto request)
        {
            if (!IsInternalRequest())
                return Unauthorized(new { error = "Invalid internal key" });

            _logger.LogInformation("AgentJoin: Room={RoomName}, Agent={AgentId}", 
                request.RoomName, request.AgentId);

            // Fetch agent config
            if (!Guid.TryParse(request.AgentId, out var agentId))
                return BadRequest(new { error = "Invalid agent_id" });

            var agent = await _context.Agents
                .Include(a => a.Tenant)
                .FirstOrDefaultAsync(a => a.Id == agentId);

            if (agent == null)
                return NotFound(new { error = "Agent not found" });

            // Build metadata for Go Agent
            var metadata = new Dictionary<string, string>
            {
                ["tenant_id"] = agent.TenantId.ToString(),
                ["agent_id"] = agent.Id.ToString(),
                ["caller_number"] = request.CallerNumber ?? "",
                ["freeswitch_uuid"] = request.FreeSwitchUUID ?? "",
                ["caller_name"] = await GetCallerContext(agent.TenantId, request.CallerNumber)
            };

            // Call Go Agent /worker/join
            var goAgentUrl = _configuration["GO_AGENT_URL"] ?? "http://go-agent.ai-engine.svc.cluster.local:8080";
            var workerPayload = new
            {
                room_name = request.RoomName,
                ai_provider = agent.Provider,
                system_prompt = agent.PromptContext,
                metadata
            };

            var httpClient = _httpClientFactory.CreateClient();
            var content = new StringContent(
                JsonSerializer.Serialize(workerPayload),
                Encoding.UTF8,
                "application/json");

            try
            {
                var response = await httpClient.PostAsync($"{goAgentUrl}/worker/join", content);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("AgentJoin: Go Agent returned {Status}", response.StatusCode);
                    return StatusCode(502, new { error = "Go agent unavailable" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AgentJoin: Failed to reach Go Agent");
                return StatusCode(502, new { error = "Go agent connection failed" });
            }

            // Create initial call record
            var callRecord = new CallRecord
            {
                TenantId = agent.TenantId,
                AiAgentId = agent.Id,
                CallerNumber = request.CallerNumber ?? "",
                RoomName = request.RoomName,
                FreeSwitchUUID = request.FreeSwitchUUID,
                StartTime = DateTime.UtcNow,
                Status = "active"
            };
            _context.CallRecords.Add(callRecord);
            await _context.SaveChangesAsync();

            return Ok(new { status = "agent_started", roomName = request.RoomName });
        }

        // ─────────────────────────────────────────────────────────────────
        // POST /api/internal/cdr
        // Called by FreeSWITCH (mod_json_cdr) and Go Agent after each call
        // Updates call record with duration, cost, sentiment
        // ─────────────────────────────────────────────────────────────────
        [HttpPost("cdr")]
        public async Task<ActionResult> ReceiveCDR([FromBody] CDRDto cdr)
        {
            if (!IsInternalRequest())
                return Unauthorized(new { error = "Invalid internal key" });

            _logger.LogInformation("CDR: Received for room={RoomName}, duration={Duration}s",
                cdr.RoomName, cdr.DurationSecs);

            // Find and update call record
            var callRecord = await _context.CallRecords
                .FirstOrDefaultAsync(c => c.RoomName == cdr.RoomName ||
                                         c.FreeSwitchUUID == cdr.FreeSwitchUUID);

            if (callRecord != null)
            {
                callRecord.EndTime = cdr.EndTime ?? DateTime.UtcNow;
                callRecord.DurationSeconds = cdr.DurationSecs;
                callRecord.HangupCause = cdr.HangupCause;
                callRecord.Status = "completed";
                callRecord.TransferredTo = cdr.TransferredTo;
                callRecord.Sentiment = cdr.Sentiment;

                // Calculate cost (example: $0.05 per minute)
                callRecord.CostUsd = Math.Round((cdr.DurationSecs / 60.0m) * 0.05m, 4);

                await _context.SaveChangesAsync();
                _logger.LogInformation("CDR: Updated record for room {RoomName}, cost=${Cost}",
                    cdr.RoomName, callRecord.CostUsd);
            }
            else
            {
                _logger.LogWarning("CDR: No matching call record found for room {RoomName}", cdr.RoomName);
            }

            return Ok(new { status = "cdr_recorded" });
        }

        // ─────────────────────────────────────────────────────────────────
        // POST /api/internal/transfer
        // Called by Go Agent when Gemini requests a human transfer
        // Notifies the tenant's team via WebSocket/Webhook
        // ─────────────────────────────────────────────────────────────────
        [HttpPost("transfer")]
        public async Task<ActionResult> InitiateTransfer([FromBody] TransferDto request)
        {
            if (!IsInternalRequest())
                return Unauthorized(new { error = "Invalid internal key" });

            _logger.LogInformation("Transfer: Room={RoomName}, Type={Type}", 
                request.RoomName, request.Type);

            // Notify tenant webhooks about the transfer
            if (Guid.TryParse(request.TenantId, out var tenantId))
            {
                var webhooks = await _context.Webhooks
                    .Where(w => w.TenantId == tenantId && w.IsActive)
                    .ToListAsync();

                var payload = new
                {
                    @event = "call.transfer",
                    roomName = request.RoomName,
                    type = request.Type,
                    timestamp = DateTime.UtcNow
                };

                var httpClient = _httpClientFactory.CreateClient();
                foreach (var webhook in webhooks)
                {
                    try
                    {
                        var content = new StringContent(
                            JsonSerializer.Serialize(payload),
                            Encoding.UTF8, "application/json");
                        await httpClient.PostAsync(webhook.Url, content);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Transfer webhook failed for {Url}", webhook.Url);
                    }
                }
            }

            return Ok(new { status = "transfer_notified" });
        }

        // ─────────────────────────────────────────────────────────────────
        // POST /api/internal/webhook-action
        // Called by Go Agent when Gemini triggers a business action
        // Proxies the request to the tenant's registered webhook
        // ─────────────────────────────────────────────────────────────────
        [HttpPost("webhook-action")]
        public async Task<ActionResult> WebhookAction([FromBody] WebhookActionDto request)
        {
            if (!IsInternalRequest())
                return Unauthorized(new { error = "Invalid internal key" });

            if (!Guid.TryParse(request.TenantId, out var tenantId))
                return BadRequest(new { error = "Invalid tenant_id" });

            _logger.LogInformation("WebhookAction: Tenant={TenantId}, Action={Action}",
                request.TenantId, request.Action);

            // Find tenant's action webhook
            var webhook = await _context.Webhooks
                .FirstOrDefaultAsync(w => w.TenantId == tenantId && w.IsActive);

            if (webhook == null)
                return NotFound(new { error = "No webhook configured for tenant" });

            // Forward to tenant's webhook
            var payload = new
            {
                @event = "ai.action",
                action = request.Action,
                @params = request.Params,
                timestamp = DateTime.UtcNow
            };

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(15);

            try
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(webhook.Url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                return Ok(new
                {
                    status = response.IsSuccessStatusCode ? "success" : "webhook_error",
                    statusCode = (int)response.StatusCode,
                    response = responseBody
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebhookAction: Failed to call tenant webhook {Url}", webhook.Url);
                return StatusCode(502, new { error = "Webhook call failed" });
            }
        }

        // ─────────────────────────────────────────────────────────────────
        // GET /api/internal/health  
        // Used by OpenSIPS and other internal services for health checks
        // ─────────────────────────────────────────────────────────────────
        [HttpGet("health")]
        public ActionResult InternalHealth()
        {
            return Ok(new { status = "ok", service = "cpaas-backend", timestamp = DateTime.UtcNow });
        }

        // ─────────────────────────────────────────────────────────────────
        // Private helpers
        // ─────────────────────────────────────────────────────────────────

        /// <summary>
        /// Fetches caller context (name, history) to inject into AI prompt
        /// </summary>
        private async Task<string> GetCallerContext(Guid tenantId, string? callerNumber)
        {
            if (string.IsNullOrEmpty(callerNumber))
                return "unknown";

            // Look for recent call history for this number
            var recentCalls = await _context.CallRecords
                .Where(c => c.TenantId == tenantId &&
                           c.CallerNumber == callerNumber &&
                           c.StartTime > DateTime.UtcNow.AddDays(-30))
                .OrderByDescending(c => c.StartTime)
                .Take(1)
                .ToListAsync();

            if (recentCalls.Any())
                return $"returning_caller_with_{recentCalls.Count}_recent_calls";

            return "new_caller";
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // DTOs
    // ─────────────────────────────────────────────────────────────────

    public class PhoneConfigDto
    {
        public string TenantId { get; set; } = string.Empty;
        public string AgentId { get; set; } = string.Empty;
        public string Provider { get; set; } = "gemini";
        public string Prompt { get; set; } = string.Empty;
        public string? WelcomeMessage { get; set; }
        public string VoiceId { get; set; } = "default";
        public string ModelName { get; set; } = string.Empty;
        public List<string> WebhookUrls { get; set; } = new();
    }

    public class AgentJoinDto
    {
        public string RoomName { get; set; } = string.Empty;
        public string AgentId { get; set; } = string.Empty;
        public string? CallerNumber { get; set; }
        public string? FreeSwitchUUID { get; set; }
    }

    public class CDRDto
    {
        public string? FreeSwitchUUID { get; set; }
        public string? RoomName { get; set; }
        public string? TenantId { get; set; }
        public string? AgentId { get; set; }
        public string? CallerNumber { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int DurationSecs { get; set; }
        public string? HangupCause { get; set; }
        public string? TransferredTo { get; set; }
        public string? Sentiment { get; set; }
    }

    public class TransferDto
    {
        public string RoomName { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string Type { get; set; } = "sip";
        public string? TargetSipUri { get; set; }
    }

    public class WebhookActionDto
    {
        public string TenantId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public Dictionary<string, object>? Params { get; set; }
    }
}
