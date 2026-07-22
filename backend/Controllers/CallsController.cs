using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Linq;
using System;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CallsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CallsController(AppDbContext context)
        {
            _context = context;
        }

        public class CallRecordDto
        {
            public Guid Id { get; set; }
            public string AgentName { get; set; } = string.Empty;
            public string CallerNumber { get; set; } = string.Empty;
            public string CalledNumber { get; set; } = string.Empty;
            public DateTime StartTime { get; set; }
            public DateTime? EndTime { get; set; }
            public int DurationSeconds { get; set; }
            public decimal CostUsd { get; set; }
            public string Status { get; set; } = string.Empty;
            public string? HangupCause { get; set; }
            public string? Sentiment { get; set; }
            public string? TransferredTo { get; set; }
            public string? Transcript { get; set; }
            public string Direction { get; set; } = "inbound";
            public string? RoomName { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CallRecordDto>>> GetCalls()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var calls = await _context.CallRecords
                .Include(c => c.AiAgent)
                .Where(c => c.TenantId == tenantId)
                .OrderByDescending(c => c.StartTime)
                .Select(c => new CallRecordDto
                {
                    Id = c.Id,
                    AgentName = c.AiAgent != null ? c.AiAgent.Name : "Deleted Agent",
                    CallerNumber = c.CallerNumber,
                    CalledNumber = c.CalledNumber,
                    StartTime = c.StartTime,
                    EndTime = c.EndTime,
                    DurationSeconds = c.DurationSeconds,
                    CostUsd = c.CostUsd,
                    Status = c.Status,
                    HangupCause = c.HangupCause,
                    Sentiment = c.Sentiment,
                    TransferredTo = c.TransferredTo,
                    Transcript = c.Transcript,
                    Direction = c.Direction,
                    RoomName = c.RoomName
                })
                .ToListAsync();

            return Ok(calls);
        }
    }
}
