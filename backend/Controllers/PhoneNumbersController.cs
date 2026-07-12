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
    public class PhoneNumbersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PhoneNumbersController(AppDbContext context)
        {
            _context = context;
        }

        public class PhoneNumberDto
        {
            public Guid Id { get; set; }
            public string Number { get; set; } = string.Empty;
            public Guid? AiAgentId { get; set; }
            public string? AgentName { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        public class UpdateRoutingDto
        {
            public Guid? AiAgentId { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhoneNumberDto>>> GetPhoneNumbers()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var numbers = await _context.PhoneNumbers
                .Include(p => p.AiAgent)
                .Where(p => p.TenantId == tenantId)
                .Select(p => new PhoneNumberDto
                {
                    Id = p.Id,
                    Number = p.Number,
                    AiAgentId = p.AiAgentId,
                    AgentName = p.AiAgent != null ? p.AiAgent.Name : null,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(numbers);
        }

        // Simulating purchasing a number (in reality this hits Twilio/LiveKit SIP)
        [HttpPost("purchase")]
        public async Task<ActionResult<PhoneNumberDto>> PurchaseNumber()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            // Generate a fake phone number for demo purposes
            var random = new Random();
            var fakeNumber = "+1800" + random.Next(1000000, 9999999).ToString();

            var phoneNumber = new PhoneNumber
            {
                TenantId = tenantId,
                Number = fakeNumber,
                AiAgentId = null
            };

            _context.PhoneNumbers.Add(phoneNumber);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPhoneNumbers), new { id = phoneNumber.Id }, new PhoneNumberDto
            {
                Id = phoneNumber.Id,
                Number = phoneNumber.Number,
                AiAgentId = phoneNumber.AiAgentId,
                AgentName = null,
                CreatedAt = phoneNumber.CreatedAt
            });
        }

        [HttpPut("{id}/route")]
        public async Task<IActionResult> UpdateRouting(Guid id, [FromBody] UpdateRoutingDto dto)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var phoneNumber = await _context.PhoneNumbers.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (phoneNumber == null)
                return NotFound();

            // Verify the agent belongs to this tenant if not null
            if (dto.AiAgentId.HasValue)
            {
                var agentExists = await _context.Agents.AnyAsync(a => a.Id == dto.AiAgentId.Value && a.TenantId == tenantId);
                if (!agentExists)
                    return BadRequest("Agent not found or doesn't belong to this tenant");
            }

            phoneNumber.AiAgentId = dto.AiAgentId;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNumber(Guid id)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var phoneNumber = await _context.PhoneNumbers.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (phoneNumber == null)
                return NotFound();

            _context.PhoneNumbers.Remove(phoneNumber);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
