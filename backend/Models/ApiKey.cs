using System;

namespace backend.Models
{
    public class ApiKey
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Only a hash of the key is stored in the database for security.
        /// </summary>
        public string KeyHash { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastUsedAt { get; set; }
    }
}
