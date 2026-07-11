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
    }
}
