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
using backend.Services;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PhoneNumbersController : ControllerBase
    {
        private readonly SharedDbContext _sharedDb;
        private readonly TenantDbContext _tenantDb;
        private readonly ITenantProvider _tenantProvider;

        public PhoneNumbersController(SharedDbContext sharedDb, TenantDbContext tenantDb, ITenantProvider tenantProvider)
        {
            _sharedDb = sharedDb;
            _tenantDb = tenantDb;
            _tenantProvider = tenantProvider;
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
            if (!Guid.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var numbers = await _sharedDb.PhoneNumbers
                .Where(p => p.TenantId == tenantId)
                .ToListAsync();

            // We need to get AgentNames from TenantDbContext
            var agentIds = numbers.Where(n => n.AiAgentId.HasValue).Select(n => n.AiAgentId.Value).ToList();
            var agents = await _tenantDb.Agents.Where(a => agentIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, a => a.Name);

            var result = numbers.Select(p => new PhoneNumberDto
            {
                Id = p.Id,
                Number = p.Number,
                AiAgentId = p.AiAgentId,
                AgentName = p.AiAgentId.HasValue && agents.ContainsKey(p.AiAgentId.Value) ? agents[p.AiAgentId.Value] : null,
                CreatedAt = p.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPost("purchase")]
        public async Task<ActionResult<PhoneNumberDto>> PurchaseNumber()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var random = new Random();
            var fakeNumber = "+1800" + random.Next(1000000, 9999999).ToString();

            var phoneNumber = new PhoneNumber
            {
                TenantId = tenantId,
                Number = fakeNumber,
                AiAgentId = null
            };

            _sharedDb.PhoneNumbers.Add(phoneNumber);
            await _sharedDb.SaveChangesAsync();

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
            if (!Guid.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var phoneNumber = await _sharedDb.PhoneNumbers.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (phoneNumber == null)
                return NotFound();

            if (dto.AiAgentId.HasValue)
            {
                var agentExists = await _tenantDb.Agents.AnyAsync(a => a.Id == dto.AiAgentId.Value);
                if (!agentExists)
                    return BadRequest("Agent not found or doesn't belong to this tenant");
            }

            phoneNumber.AiAgentId = dto.AiAgentId;
            await _sharedDb.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNumber(Guid id)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId)) return Unauthorized();

            var phoneNumber = await _sharedDb.PhoneNumbers.FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenantId);
            if (phoneNumber == null)
                return NotFound();

            _sharedDb.PhoneNumbers.Remove(phoneNumber);
            await _sharedDb.SaveChangesAsync();
            return NoContent();
        }
    }
}
