using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
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
            return await _context.Agents.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<AiAgent>> CreateAgent(AiAgent agent)
        {
            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAgents), new { id = agent.Id }, agent);
        }
    }
}
