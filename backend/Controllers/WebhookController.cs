using Microsoft.AspNetCore.Mvc;
using backend.Data;
using System.Text.Json;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/webhook/livekit")]
    public class WebhookController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public WebhookController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost]
        public async Task<IActionResult> HandleLiveKitWebhook()
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            // In production, verify the "Authorization" header using LiveKit API Secret
            
            try 
            {
                var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;
                
                if (root.TryGetProperty("event", out var eventType) && eventType.GetString() == "participant_joined")
                {
                    var participant = root.GetProperty("participant");
                    var identity = participant.GetProperty("identity").GetString();
                    
                    // If this is a SIP participant, wake up the AI
                    // The identity from livekit-sip typically starts with sip_
                    if (identity != null && identity.StartsWith("sip_"))
                    {
                        var room = root.GetProperty("room");
                        var roomName = room.GetProperty("name").GetString();
                        
                        var workerPayload = new
                        {
                            room_name = roomName,
                            ai_provider = "gemini",
                            system_prompt = "You are a helpful phone assistant answering an inbound call.",
                            metadata = new Dictionary<string, string>()
                        };

                        var httpClient = _httpClientFactory.CreateClient();
                        var content = new StringContent(JsonSerializer.Serialize(workerPayload), Encoding.UTF8, "application/json");
                        
                        // Wake up the AI Agent
                        await httpClient.PostAsync("http://127.0.0.1:8080/worker/join", content);
                    }
                }
            }
            catch(Exception)
            {
                // Ignore parsing exceptions
            }

            return Ok();
        }
    }
}
