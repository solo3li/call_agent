using System.Net;
using System.Net.Sockets;

namespace backend.Services
{
    public class UdpAudioServer
    {
        private readonly ILogger<UdpAudioServer> _logger;

        public UdpAudioServer(ILogger<UdpAudioServer> logger)
        {
            _logger = logger;
        }

        public async Task StartStreamingAsync(int port, IAudioAiClient aiClient, CancellationToken cancellationToken)
        {
            using var udpClient = new UdpClient(port);
            _logger.LogInformation("UDP Audio Server listening on port {Port}", port);

            try
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    var result = await udpClient.ReceiveAsync(cancellationToken);
                    // result.Buffer contains raw audio from Asterisk (usually RTP or raw ULAW)
                    // Send to AI
                    await aiClient.SendAudioAsync(result.Buffer, cancellationToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("UDP Audio Server stopped for port {Port}", port);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UDP Audio Server on port {Port}", port);
            }
        }
    }
}
