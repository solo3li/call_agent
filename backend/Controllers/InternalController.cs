using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;
using System.Text.Json;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/internal")]
    public class InternalController : ControllerBase
    {
        private readonly SharedDbContext _sharedDb;
        private readonly TenantDbContext _tenantDb;
        private readonly ITenantProvider _tenantProvider;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<InternalController> _logger;

        public InternalController(
            SharedDbContext sharedDb,
            TenantDbContext tenantDb,
            ITenantProvider tenantProvider,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<InternalController> logger)
        {
            _sharedDb = sharedDb;
            _tenantDb = tenantDb;
            _tenantProvider = tenantProvider;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        private bool IsInternalRequest()
        {
            var expectedKey = _configuration["INTERNAL_API_KEY"];
            var providedKey = Request.Headers["X-Internal-Key"].FirstOrDefault();
            return !string.IsNullOrEmpty(expectedKey) && expectedKey == providedKey;
        }

        private async Task<bool> SwitchToTenantSchema(Guid tenantId)
        {
            var tenant = await _sharedDb.Tenants.FindAsync(tenantId);
            if (tenant != null && tenant.IsActive)
            {
                _tenantProvider.SetTenantInfo(tenant.SchemaName, tenant.Id);
                return true;
            }
            return false;
        }

        [HttpGet("phone-config/{number}")]
        public async Task<ActionResult<PhoneConfigDto>> GetPhoneConfig(string number)
        {
            if (!IsInternalRequest()) return Unauthorized(new { error = "Invalid internal key" });

            var normalized = number.TrimStart('+').Trim();
            
            var phoneNumber = await _sharedDb.PhoneNumbers
                .FirstOrDefaultAsync(p =>
                    p.Number == normalized ||
                    p.Number == "+" + normalized ||
                    p.Number.Replace("+", "").Replace(" ", "") == normalized);

            if (phoneNumber == null || phoneNumber.AiAgentId == null)
                return NotFound(new { error = "number_not_configured", number = normalized });

            if (!await SwitchToTenantSchema(phoneNumber.TenantId))
                return BadRequest(new { error = "tenant_inactive" });

            var webhooks = await _tenantDb.Webhooks.ToListAsync();
            var agent = await _tenantDb.Agents.Include(a => a.Persona).FirstOrDefaultAsync(a => a.Id == phoneNumber.AiAgentId.Value);

            if (agent == null)
                return NotFound(new { error = "agent_not_found" });

            return Ok(new PhoneConfigDto
            {
                TenantId = phoneNumber.TenantId.ToString(),
                AgentId = agent.Id.ToString(),
                Provider = agent.Persona?.Provider ?? "google",
                Prompt = agent.Persona?.SystemPrompt ?? "You are a helpful assistant.",
                WelcomeMessage = "Hello", // Removed from Agent, could be added to Persona later if needed
                VoiceId = agent.Persona?.VoiceId ?? "Nova",
                ModelName = agent.Persona?.ModelName ?? "gemini-1.5-pro",
                WebhookUrls = webhooks.Select(w => w.Url).ToList()
            });
        }

        [HttpPost("agent-join")]
        public async Task<ActionResult> AgentJoin([FromBody] AgentJoinDto request)
        {
            if (!IsInternalRequest()) return Unauthorized(new { error = "Invalid internal key" });

            if (!Guid.TryParse(request.TenantId, out var tenantId) || !await SwitchToTenantSchema(tenantId))
                return BadRequest(new { error = "Invalid tenant_id" });

            if (!Guid.TryParse(request.AgentId, out var agentId))
                return BadRequest(new { error = "Invalid agent_id" });

            var agent = await _tenantDb.Agents.Include(a => a.Persona).FirstOrDefaultAsync(a => a.Id == agentId);
            if (agent == null) return NotFound(new { error = "Agent not found" });

            var metadata = new Dictionary<string, string>
            {
                ["tenant_id"] = request.TenantId,
                ["agent_id"] = agent.Id.ToString(),
                ["caller_number"] = request.CallerNumber ?? "",
                ["freeswitch_uuid"] = request.FreeSwitchUUID ?? "",
                ["caller_name"] = await GetCallerContext(request.CallerNumber)
            };

            var goAgentUrl = _configuration["GO_AGENT_URL"] ?? "http://go-agent.ai-engine.svc.cluster.local:8080";
            var workerPayload = new
            {
                room_name = request.RoomName,
                ai_provider = agent.Persona?.Provider ?? "google",
                system_prompt = agent.Persona?.SystemPrompt ?? "You are a helpful assistant.",
                metadata
            };

            var httpClient = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(workerPayload), Encoding.UTF8, "application/json");

            try
            {
                var response = await httpClient.PostAsync($"{goAgentUrl}/worker/join", content);
                if (!response.IsSuccessStatusCode)
                    return StatusCode(502, new { error = "Go agent unavailable" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AgentJoin: Failed to reach Go Agent");
                return StatusCode(502, new { error = "Go agent connection failed" });
            }

            var callRecord = new CallRecord
            {
                AiAgentId = agent.Id,
                CallerNumber = request.CallerNumber ?? "",
                RoomName = request.RoomName,
                FreeSwitchUUID = request.FreeSwitchUUID,
                StartTime = DateTime.UtcNow,
                Status = "active"
            };
            
            _tenantDb.CallRecords.Add(callRecord);
            await _tenantDb.SaveChangesAsync();

            return Ok(new { status = "agent_started", roomName = request.RoomName });
        }

        [HttpPost("action-log")]
        public async Task<IActionResult> LogAction([FromBody] ActionLogDto dto)
        {
            var logEntry = new CallActionLog
            {
                CallRecordId = dto.call_id,
                ActionName = dto.action_name,
                InputJson = System.Text.Json.JsonSerializer.Serialize(dto.parameters),
                OutputJson = dto.result != null ? System.Text.Json.JsonSerializer.Serialize(dto.result) : "{}",
                DurationMs = dto.duration_ms,
                Success = dto.success,
                CreatedAt = dto.timestamp
            };

            _tenantDb.ActionLogs.Add(logEntry);
            await _tenantDb.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("cdr")]
        public async Task<ActionResult> ReceiveCDR([FromBody] CDRDto cdr)
        {
            if (!IsInternalRequest()) return Unauthorized(new { error = "Invalid internal key" });

            if (!Guid.TryParse(cdr.TenantId, out var tenantId) || !await SwitchToTenantSchema(tenantId))
                return BadRequest(new { error = "Invalid tenant_id" });

            var callRecord = await _tenantDb.CallRecords
                .FirstOrDefaultAsync(c => c.RoomName == cdr.RoomName || c.FreeSwitchUUID == cdr.FreeSwitchUUID);

            if (callRecord != null)
            {
                callRecord.EndTime = cdr.EndTime ?? DateTime.UtcNow;
                callRecord.DurationSeconds = cdr.DurationSecs;
                callRecord.HangupCause = cdr.HangupCause;
                callRecord.Status = "completed";
                callRecord.TransferredTo = cdr.TransferredTo;
                callRecord.Sentiment = cdr.Sentiment;
                callRecord.CostUsd = Math.Round((cdr.DurationSecs / 60.0m) * 0.05m, 4);

                await _tenantDb.SaveChangesAsync();
            }

            return Ok(new { status = "cdr_recorded" });
        }

        [HttpPost("transfer")]
        public async Task<ActionResult> InitiateTransfer([FromBody] TransferDto request)
        {
            if (!IsInternalRequest()) return Unauthorized(new { error = "Invalid internal key" });

            if (!Guid.TryParse(request.TenantId, out var tenantId) || !await SwitchToTenantSchema(tenantId))
                return BadRequest(new { error = "Invalid tenant_id" });

            var webhooks = await _tenantDb.Webhooks.Where(w => w.IsActive).ToListAsync();

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
                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    await httpClient.PostAsync(webhook.Url, content);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Transfer webhook failed for {Url}", webhook.Url);
                }
            }

            return Ok(new { status = "transfer_notified" });
        }

        [HttpPost("webhook-action")]
        public async Task<ActionResult> WebhookAction([FromBody] WebhookActionDto request)
        {
            if (!IsInternalRequest()) return Unauthorized(new { error = "Invalid internal key" });

            if (!Guid.TryParse(request.TenantId, out var tenantId) || !await SwitchToTenantSchema(tenantId))
                return BadRequest(new { error = "Invalid tenant_id" });

            var webhook = await _tenantDb.Webhooks.FirstOrDefaultAsync(w => w.IsActive);
            if (webhook == null) return NotFound(new { error = "No webhook configured for tenant" });

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
                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(webhook.Url, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                return Ok(new
                {
                    status = response.IsSuccessStatusCode ? "success" : "webhook_error",
                    statusCode = (int)response.StatusCode,
                    response = responseBody
                });
            }
            catch (Exception)
            {
                return StatusCode(502, new { error = "Webhook call failed" });
            }
        }

        [HttpGet("health")]
        public ActionResult InternalHealth()
        {
            return Ok(new { status = "ok", service = "cpaas-backend", timestamp = DateTime.UtcNow });
        }

        [HttpGet("fs-config")]
        [Produces("application/xml")]
        public async Task<IActionResult> GetFreeSwitchConfig([FromQuery] string section, [FromQuery] string user, [FromQuery] string domain)
        {
            if (section == "directory")
            {
                if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(domain))
                    return NotFound();

                // Resolve domain to tenant
                var tenantDomain = await _sharedDb.TenantDomains.FirstOrDefaultAsync(td => td.Hostname == domain);
                if (tenantDomain == null)
                    return NotFound();

                if (!await SwitchToTenantSchema(tenantDomain.TenantId))
                    return NotFound();

                var sipAccount = await _tenantDb.SipAccounts.FirstOrDefaultAsync(sa => sa.Extension == user);
                if (sipAccount == null)
                    return NotFound();

                var xmlTemplate = @"
<document type=""freeswitch/xml"">
  <section name=""directory"">
    <domain name=""{DOMAIN}"">
      <params>
        <param name=""dial-string"" value=""{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}""/>
      </params>
      <groups>
        <group name=""default"">
          <users>
            <user id=""{USER}"">
              <params>
                <param name=""password"" value=""{PASSWORD}""/>
              </params>
              <variables>
                <variable name=""user_context"" value=""cpaas_inbound""/>
              </variables>
            </user>
          </users>
        </group>
      </groups>
    </domain>
  </section>
</document>";

                var xml = xmlTemplate
                    .Replace("{DOMAIN}", domain)
                    .Replace("{USER}", sipAccount.Extension)
                    .Replace("{PASSWORD}", sipAccount.PasswordEnc);

                return Content(xml, "application/xml");
            }
            
            return NotFound();
        }

        private async Task<string> GetCallerContext(string? callerNumber)
        {
            if (string.IsNullOrEmpty(callerNumber)) return "unknown";

            var recentCalls = await _tenantDb.CallRecords
                .Where(c => c.CallerNumber == callerNumber && c.StartTime > DateTime.UtcNow.AddDays(-30))
                .OrderByDescending(c => c.StartTime)
                .Take(1)
                .ToListAsync();

            if (recentCalls.Any()) return $"returning_caller_with_{recentCalls.Count}_recent_calls";

            return "new_caller";
        }
    }

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
        public string TenantId { get; set; } = string.Empty;
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

    public class ActionLogDto
    {
        public Guid call_id { get; set; }
        public string action_name { get; set; } = string.Empty;
        public Dictionary<string, object>? parameters { get; set; }
        public object? result { get; set; }
        public int duration_ms { get; set; }
        public bool success { get; set; }
        public DateTime timestamp { get; set; }
    }
}
