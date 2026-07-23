using System;

namespace backend.Models
{
    public class AiAgent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public Tenant? Tenant { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = "google"; // Default to Google now
        public string ModelName { get; set; } = "gemini-1.5-pro";
        public string PromptContext { get; set; } = string.Empty;
        public string? WelcomeMessage { get; set; }
        public string VoiceId { get; set; } = "Nova";
        
        // Advanced Customization
        public string Language { get; set; } = "English (US)";
        public string Dialect { get; set; } = "en-US";
        public string Emotion { get; set; } = "Professional";
        public string SpeakingStyle { get; set; } = "Calm";
        public string FallbackNumber { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<CallRecord> CallRecords { get; set; } = new List<CallRecord>();
        public ICollection<PhoneNumber> PhoneNumbers { get; set; } = new List<PhoneNumber>();
    }
}
