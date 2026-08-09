using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Persona
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        public string VoiceId { get; set; } = string.Empty;
        public string Language { get; set; } = "ar";
        
        public string Provider { get; set; } = "google";
        public string ModelName { get; set; } = "gemini-1.5-pro";
        
        public string SystemPrompt { get; set; } = string.Empty;
        
        public string PersonalityJson { get; set; } = "{}";
        public string BehaviorRulesJson { get; set; } = "[]";
        
        public Guid? KnowledgeBaseId { get; set; }
        public KnowledgeBase? KnowledgeBase { get; set; }
        
        public bool IsActive { get; set; } = true;
        public int Version { get; set; } = 1;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
