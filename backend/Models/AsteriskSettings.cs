namespace backend.Models
{
    public class AsteriskSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string AppName { get; set; } = string.Empty;
        
        public string BaseUrl => $"http://{Host}:{Port}/ari";
        public string WsUrl => $"ws://{Host}:{Port}/ari/events";
    }
}
