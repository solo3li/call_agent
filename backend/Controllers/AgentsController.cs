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
        private readonly AppDbContext _context;

        public AgentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AiAgent>>> GetAgents()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();
                
            return await _context.Agents.Where(a => a.TenantId == tenantId).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<AiAgent>> CreateAgent(AiAgent agent)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();
            
            agent.TenantId = tenantId;
            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAgents), new { id = agent.Id }, agent);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAgent(Guid id, AiAgent agentUpdates)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);
            if (agent == null)
                return NotFound();

            agent.Name = agentUpdates.Name;
            agent.PromptContext = agentUpdates.PromptContext;
            agent.WelcomeMessage = agentUpdates.WelcomeMessage;
            agent.VoiceId = agentUpdates.VoiceId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgent(Guid id)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId);
            if (agent == null)
                return NotFound();

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
