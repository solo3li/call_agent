namespace backend.Services
{
    public interface IAudioAiClient : IDisposable
    {
        Task ConnectAsync(string modelName, CancellationToken cancellationToken);
        Task SendAudioAsync(byte[] audioData, CancellationToken cancellationToken);
        
        // Optional: event or action to trigger when AI returns audio to send back to Asterisk
        // Action<byte[]> OnAudioReceived { get; set; }
    }
}
