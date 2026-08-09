using System;

namespace backend.Models
{
    public class MarketplacePersona
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // e.g. "Medical", "Real Estate"
        
        public string AvatarUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public string VoiceId { get; set; } = string.Empty;
        public string Language { get; set; } = "ar";
        
        public string SystemPromptTemplate { get; set; } = string.Empty;
        public string PersonalityJson { get; set; } = "{}";
        public string BehaviorRulesJson { get; set; } = "[]";
        
        public decimal PriceUsd { get; set; } = 0m;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
