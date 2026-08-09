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
    public class AgentsController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public AgentsController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AiAgent>>> GetAgents()
        {
            return await _context.Agents.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<AiAgent>> CreateAgent(AiAgent agent)
        {
            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAgents), new { id = agent.Id }, agent);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAgent(Guid id, AiAgent agentUpdates)
        {
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id);
            if (agent == null)
                return NotFound();

            agent.Name = agentUpdates.Name;
            agent.PersonaId = agentUpdates.PersonaId;
            agent.IsActive = agentUpdates.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgent(Guid id)
        {
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id);
            if (agent == null)
                return NotFound();

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
