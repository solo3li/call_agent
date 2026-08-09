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
        private readonly TenantDbContext _context;

        public CallsController(TenantDbContext context)
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
            var calls = await _context.CallRecords
                .Include(c => c.AiAgent)
                
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

        [HttpGet("{id}/timeline")]
        public async Task<ActionResult<IEnumerable<object>>> GetCallTimeline(Guid id)
        {
            var call = await _context.CallRecords.FindAsync(id);
            if (call == null) return NotFound();

            var actionLogs = await _context.ActionLogs
                .Where(log => log.CallRecordId == id)
                .OrderBy(log => log.CreatedAt)
                .ToListAsync();

            var timeline = new List<object>();
            timeline.Add(new { type = "started", time = call.StartTime, data = new { caller = call.CallerNumber } });

            foreach (var log in actionLogs)
            {
                timeline.Add(new { 
                    type = "action", 
                    time = log.CreatedAt, 
                    data = new { 
                        action = log.ActionName, 
                        params_json = log.InputJson, 
                        result_json = log.OutputJson, 
                        duration_ms = log.DurationMs, 
                        success = log.Success 
                    } 
                });
            }

            if (call.EndTime.HasValue)
            {
                timeline.Add(new { type = "ended", time = call.EndTime.Value, data = new { duration = call.DurationSeconds, cost = call.CostUsd } });
            }

            return Ok(timeline.OrderBy(t => ((dynamic)t).time));
        }
    }
}
