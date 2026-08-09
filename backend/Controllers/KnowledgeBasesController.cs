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

        [HttpPost("upload")]
        public async Task<ActionResult<KnowledgeBase>> UploadKnowledgeBase([FromForm] string name, [FromForm] string sourceType, [FromForm] string? sourceUrl)
        {
            // Mock file/URL extraction logic for RAG
            // In reality, this would upload to an LLM provider or process PDF to VectorDB
            var kb = new KnowledgeBase 
            {
                Name = name,
                SourceType = sourceType,
                SourceUrl = sourceUrl ?? string.Empty,
                Description = $"Processed {sourceType} data",
                IsProcessed = true // Simulate immediate processing
            };
            
            _context.KnowledgeBases.Add(kb);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetKnowledgeBase), new { id = kb.Id }, kb);
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
