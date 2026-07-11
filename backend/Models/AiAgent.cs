using System;

namespace backend.Models
{
    public class AiAgent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string PromptContext { get; set; } = string.Empty;
        public string? WelcomeMessage { get; set; }
        public string VoiceId { get; set; } = "default-voice";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
