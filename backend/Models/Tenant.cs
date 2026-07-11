using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Tenant
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string? SubscriptionPlan { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<AiAgent> Agents { get; set; } = new List<AiAgent>();
    }
}
