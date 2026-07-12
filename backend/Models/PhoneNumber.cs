using System;

namespace backend.Models
{
    public class PhoneNumber
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Number { get; set; } = string.Empty;
        
        // The Agent this phone number routes to
        public Guid? AiAgentId { get; set; }
        public AiAgent? AiAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
