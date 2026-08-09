using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("phone_numbers", Schema = "public")]
    public class PhoneNumber
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Number { get; set; } = string.Empty;
        
        // The Agent this phone number routes to
        public Guid? AiAgentId { get; set; }
        
        // Cannot have a navigation property to AiAgent since it's in a different schema
        // public AiAgent? AiAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
