using System;

namespace backend.Models
{
    public class CallRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public Guid AiAgentId { get; set; }
        public AiAgent? AiAgent { get; set; }

        public string CallerNumber { get; set; } = string.Empty;
        public string CalledNumber { get; set; } = string.Empty;
        
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        
        // Duration in seconds
        public int Duration { get; set; }
        
        // Cost of the call (e.g. 0.05 per minute)
        public decimal Cost { get; set; }
        
        // The text transcript of the conversation
        public string Transcript { get; set; } = string.Empty;

        // URL to the audio recording if applicable
        public string? RecordingUrl { get; set; }
        
        // Whether it was completed successfully, dropped, etc
        public string Status { get; set; } = "Completed";
    }
}
