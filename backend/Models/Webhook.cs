using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Webhook
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TenantId { get; set; }
        public Tenant? Tenant { get; set; }

        public string Name { get; set; } = string.Empty;
        public string PayloadUrl { get; set; } = string.Empty;

        /// <summary>Alias for PayloadUrl — used by InternalController</summary>
        public string Url => PayloadUrl;

        /// <summary>HMAC-SHA256 signing secret for webhook payload verification</summary>
        public string? SigningSecret { get; set; }

        /// <summary>Event types to forward: call.started, call.ended, call.transfer, ai.action</summary>
        public string? EventTypes { get; set; } = "call.started,call.ended,call.transfer,ai.action";

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
