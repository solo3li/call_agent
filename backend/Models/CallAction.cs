using System;

namespace backend.Models
{
    public class CallAction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Version { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        
        // This will hold the No-Code flow / JSON schema
        public string ConfigJson { get; set; } = "{}";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
