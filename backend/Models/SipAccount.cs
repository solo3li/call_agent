using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class SipAccount
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public Guid UserId { get; set; }
        public User? User { get; set; }

        public string Extension { get; set; } = string.Empty;
        public string PasswordEnc { get; set; } = string.Empty;
        public string Type { get; set; } = "agent"; // "agent" or "test"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
