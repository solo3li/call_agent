using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("tenant_domains", Schema = "public")]
    public class TenantDomain
    {
        [Key]
        public string Hostname { get; set; } = string.Empty;
        
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }
        
        public string Type { get; set; } = "subdomain"; // "subdomain" or "custom"
        public bool IsVerified { get; set; } = false;
    }
}
