using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        public Guid TenantId { get; set; }
        
        [JsonIgnore]
        public Tenant? Tenant { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
