using System;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Contact
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Status { get; set; } = "Offline";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
