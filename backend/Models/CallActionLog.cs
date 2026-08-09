using System;

namespace backend.Models
{
    public class CallActionLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ActionId { get; set; }
        public Guid CallId { get; set; }
        
        public string InputJson { get; set; } = "{}";
        public string OutputJson { get; set; } = "{}";
        
        public int DurationMs { get; set; }
        public bool Success { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public CallAction CallAction { get; set; }
        public CallRecord Call { get; set; }
    }
}
