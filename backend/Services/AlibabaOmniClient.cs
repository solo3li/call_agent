using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class AlibabaOmniClient : IAudioAiClient
    {
        private readonly AlibabaSettings _settings;
        private readonly ILogger<AlibabaOmniClient> _logger;
        private ClientWebSocket? _webSocket;

        public AlibabaOmniClient(IOptions<AlibabaSettings> settings, ILogger<AlibabaOmniClient> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task ConnectAsync(string modelName, CancellationToken cancellationToken)
        {
            _webSocket = new ClientWebSocket();
            _webSocket.Options.SetRequestHeader("Authorization", $"Bearer {_settings.ApiKey}");
            
            _logger.LogInformation("Connecting to Alibaba Qwen Omni WebSocket...");
            await _webSocket.ConnectAsync(new Uri(_settings.WsUrl), cancellationToken);
            _logger.LogInformation("Connected to Alibaba Omni!");

            // Send initial session setup message if required by Qwen Omni protocol
            var setupMsg = new {
                header = new { action = "run-task", task_id = Guid.NewGuid().ToString() },
                payload = new {
                    model = modelName,
                    parameters = new { sample_rate = 8000, format = "ulaw" }
                }
            };
            var json = JsonSerializer.Serialize(setupMsg);
            await _webSocket.SendAsync(Encoding.UTF8.GetBytes(json), WebSocketMessageType.Text, true, cancellationToken);
            
            // Start listening for responses in background
            _ = ReceiveLoopAsync(cancellationToken);
        }

        public async Task SendAudioAsync(byte[] audioData, CancellationToken cancellationToken)
        {
            if (_webSocket?.State == WebSocketState.Open)
            {
                // Send raw audio as binary frames
                await _webSocket.SendAsync(audioData, WebSocketMessageType.Binary, true, cancellationToken);
            }
        }

        private async Task ReceiveLoopAsync(CancellationToken cancellationToken)
        {
            var buffer = new byte[8192];
            while (_webSocket?.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var text = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        _logger.LogDebug("Alibaba Omni Text: {Text}", text);
                    }
                    else if (result.MessageType == WebSocketMessageType.Binary)
                    {
                        // Received audio from AI! Here we would send it back to Asterisk via UDP
                        _logger.LogDebug("Alibaba Omni Audio Received ({Bytes} bytes)", result.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error receiving from Alibaba Omni");
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
