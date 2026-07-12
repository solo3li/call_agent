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
        
        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<AiAgent> Agents { get; set; } = new List<AiAgent>();
        public ICollection<ApiKey> ApiKeys { get; set; } = new List<ApiKey>();
        public ICollection<Webhook> Webhooks { get; set; } = new List<Webhook>();
        public ICollection<CallRecord> CallRecords { get; set; } = new List<CallRecord>();
        public ICollection<PhoneNumber> PhoneNumbers { get; set; } = new List<PhoneNumber>();
        public ICollection<SipAccount> SipAccounts { get; set; } = new List<SipAccount>();
    }
}
