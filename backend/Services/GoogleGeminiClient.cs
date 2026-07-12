using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class GoogleGeminiClient : IAudioAiClient
    {
        private readonly GoogleSettings _settings;
        private readonly ILogger<GoogleGeminiClient> _logger;
        private ClientWebSocket? _webSocket;

        public GoogleGeminiClient(IOptions<GoogleSettings> settings, ILogger<GoogleGeminiClient> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task ConnectAsync(string modelName, CancellationToken cancellationToken)
        {
            _webSocket = new ClientWebSocket();
            
            // Google BidiGenerateContent endpoint (Multimodal Live API)
            // Note: The host and path can change based on Google's exact API spec.
            var url = $"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={_settings.ApiKey}";
            
            _logger.LogInformation("Connecting to Google Gemini WebSocket...");
            await _webSocket.ConnectAsync(new Uri(url), cancellationToken);
            _logger.LogInformation("Connected to Google Gemini!");

            // Send initial setup/config frame for Gemini
            var setupMsg = new {
                setup = new {
                    model = $"models/{modelName}"
                }
            };
            var json = JsonSerializer.Serialize(setupMsg);
            await _webSocket.SendAsync(Encoding.UTF8.GetBytes(json), WebSocketMessageType.Text, true, cancellationToken);
            
            _ = ReceiveLoopAsync(cancellationToken);
        }

        public async Task SendAudioAsync(byte[] audioData, CancellationToken cancellationToken)
        {
            if (_webSocket?.State == WebSocketState.Open)
            {
                // Google usually expects audio wrapped in a realtimeInput JSON object
                var base64Audio = Convert.ToBase64String(audioData);
                var mediaMsg = new {
                    realtimeInput = new {
                        mediaChunks = new[] {
                            new { mimeType = "audio/pcm", data = base64Audio }
                        }
                    }
                };
                var json = JsonSerializer.Serialize(mediaMsg);
                await _webSocket.SendAsync(Encoding.UTF8.GetBytes(json), WebSocketMessageType.Text, true, cancellationToken);
            }
        }

        private async Task ReceiveLoopAsync(CancellationToken cancellationToken)
        {
            var buffer = new byte[16384];
            while (_webSocket?.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var text = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        _logger.LogDebug("Google Gemini Text: {Text}", text);
                        
                        // Parse JSON to extract generated audio and send back to Asterisk
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error receiving from Google Gemini");
                    break;
                }
            }
        }

        public void Dispose()
        {
            _webSocket?.Dispose();
        }
    }
}
