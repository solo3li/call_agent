using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using backend.Models;
using backend.Data;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AriEventService : BackgroundService
    {
        private readonly AsteriskSettings _settings;
        private readonly ILogger<AriEventService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private ClientWebSocket? _webSocket;

        public AriEventService(IOptions<AsteriskSettings> settings, ILogger<AriEventService> logger, IServiceProvider serviceProvider)
        {
            _settings = settings.Value;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _webSocket = new ClientWebSocket();
                    var url = $"{_settings.WsUrl}?api_key={_settings.Username}:{_settings.Password}&app={_settings.AppName}";
                    _logger.LogInformation("Connecting to Asterisk ARI WebSocket at {Url}", _settings.WsUrl);

                    await _webSocket.ConnectAsync(new Uri(url), stoppingToken);
                    _logger.LogInformation("Successfully connected to Asterisk ARI!");

                    await ReceiveLoopAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error connecting to Asterisk ARI. Retrying in 5 seconds...");
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
            }
        }

        private async Task ReceiveLoopAsync(CancellationToken stoppingToken)
        {
            var buffer = new byte[8192];

            while (_webSocket?.State == WebSocketState.Open && !stoppingToken.IsCancellationRequested)
            {
                var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), stoppingToken);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _logger.LogWarning("Asterisk closed the WebSocket connection.");
                    break;
                }

                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                _logger.LogDebug("Received ARI Event: {Message}", message);

                try
                {
                    using var doc = JsonDocument.Parse(message);
                    var type = doc.RootElement.GetProperty("type").GetString();

                    if (type == "StasisStart")
                    {
                        await HandleStasisStartAsync(doc.RootElement);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to parse ARI event.");
                }
            }
        }

        private async Task HandleStasisStartAsync(JsonElement eventElement)
        {
            var channelId = eventElement.GetProperty("channel").GetProperty("id").GetString();
            var callerNumber = eventElement.GetProperty("channel").GetProperty("caller").GetProperty("number").GetString();
            
            _logger.LogInformation("Incoming call in Stasis from {CallerNumber}. Channel ID: {ChannelId}", callerNumber, channelId);

            if (!string.IsNullOrEmpty(channelId))
            {
                using var scope = _serviceProvider.CreateScope();
                var restService = scope.ServiceProvider.GetRequiredService<AriRestService>();
                var udpServer = scope.ServiceProvider.GetRequiredService<UdpAudioServer>();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Get the first AI Agent (assuming single tenant / default agent for now)
                var agent = await dbContext.Agents.FirstOrDefaultAsync();
                
                IAudioAiClient aiClient;
                string modelName = "default";
                
                if (agent != null && agent.Provider == "google")
                {
                    aiClient = scope.ServiceProvider.GetRequiredService<GoogleGeminiClient>();
                    modelName = agent.ModelName;
                    _logger.LogInformation("Using Google Gemini model: {Model}", modelName);
                }
                else
                {
                    aiClient = scope.ServiceProvider.GetRequiredService<AlibabaOmniClient>();
                    modelName = agent?.ModelName ?? "qwen-omni-turbo";
                    _logger.LogInformation("Using Alibaba Omni model: {Model}", modelName);
                }

                // 1. Answer the call
                await restService.AnswerCallAsync(channelId);

                // 2. Connect to AI Provider
                var cts = new CancellationTokenSource();
                await aiClient.ConnectAsync(modelName, cts.Token);

                // 3. Start UDP Server (e.g. on port 15000)
                int backendUdpPort = 15000; // In production, generate dynamic available port
                _ = Task.Run(() => udpServer.StartStreamingAsync(backendUdpPort, aiClient, cts.Token));

                // 4. Tell Asterisk to create ExternalMedia channel pointing to our UDP server
                var externalChannelId = await restService.CreateExternalMediaChannelAsync(_settings.AppName, $"127.0.0.1:{backendUdpPort}");

                // 5. Bridge the caller's channel with the ExternalMedia channel
                if (!string.IsNullOrEmpty(externalChannelId))
                {
                    await restService.BridgeChannelsAsync(channelId, externalChannelId);
                    _logger.LogInformation("Call successfully bridged to AI!");
                }
            }
        }
    }
}
