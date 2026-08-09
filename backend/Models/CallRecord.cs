using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class CallRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // Agent can be null for CDR records that arrive before agent lookup
        public Guid? AiAgentId { get; set; }
        public AiAgent? AiAgent { get; set; }

        public Guid? PersonaId { get; set; }
        public Persona? Persona { get; set; }

        // Call identification
        public string CallerNumber { get; set; } = string.Empty;
        public string CalledNumber { get; set; } = string.Empty;

        // FreeSWITCH correlation IDs
        public string? FreeSwitchUUID { get; set; }
        public string? RoomName { get; set; }

        // Timestamps
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }

        // Duration in seconds (from CDR)
        public int DurationSeconds { get; set; }

        // Billing
        public decimal CostUsd { get; set; }

        // Call outcome
        public string Status { get; set; } = "active";  // active | completed | failed | transferred
        public string? HangupCause { get; set; }        // NORMAL_CLEARING | NO_ANSWER | BUSY | etc.

        // Human transfer
        // AI analysis
        public string? Sentiment { get; set; }          // positive | neutral | negative
        public string? Transcript { get; set; }         // Full conversation transcript (optional)

        [Column("recording_url")]
        public string? RecordingUrl { get; set; }

        [Column("transferred_to")]
        public string? TransferredTo { get; set; }

        [Column("supervisor_takeover_at")]
        public DateTime? SupervisorTakeoverAt { get; set; }

        // Direction
        public string Direction { get; set; } = "inbound";  // inbound | outbound

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public AiAgent? Agent { get; set; }
    }
}
