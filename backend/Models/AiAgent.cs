using System;

namespace backend.Models
{
    public class AiAgent
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;
        public Guid? PersonaId { get; set; }
        public Persona? Persona { get; set; }

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<CallRecord> CallRecords { get; set; } = new List<CallRecord>();
        public ICollection<PhoneNumber> PhoneNumbers { get; set; } = new List<PhoneNumber>();
    }
}
