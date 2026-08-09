using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class KnowledgeBase
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // e.g. "pdf", "text", "website"
        public string SourceType { get; set; } = string.Empty;
        public string SourceUrl { get; set; } = string.Empty;
        
        public bool IsProcessed { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
