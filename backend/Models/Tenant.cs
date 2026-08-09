using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("tenants", Schema = "public")]
    public class Tenant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string SchemaName { get; set; } = string.Empty;
        public string Plan { get; set; } = "starter";
        
        [Column(TypeName = "jsonb")]
        public string? BrandingJson { get; set; }
        public string? CustomDomain { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
