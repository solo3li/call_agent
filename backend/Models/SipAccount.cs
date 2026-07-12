using System;

namespace backend.Models
{
    public class SipAccount
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        
        // e.g. cpaas.178.62.192.74.nip.io
        public string Domain { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
