using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class KnowledgeBasesController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public KnowledgeBasesController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<KnowledgeBase>>> GetKnowledgeBases()
        {
            return await _context.KnowledgeBases.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KnowledgeBase>> GetKnowledgeBase(Guid id)
        {
            var kb = await _context.KnowledgeBases.FindAsync(id);
            if (kb == null) return NotFound();
            return kb;
        }

        [HttpPost]
        public async Task<ActionResult<KnowledgeBase>> CreateKnowledgeBase(KnowledgeBase knowledgeBase)
        {
            _context.KnowledgeBases.Add(knowledgeBase);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetKnowledgeBase), new { id = knowledgeBase.Id }, knowledgeBase);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKnowledgeBase(Guid id)
        {
            var kb = await _context.KnowledgeBases.FindAsync(id);
            if (kb == null) return NotFound();
            _context.KnowledgeBases.Remove(kb);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
