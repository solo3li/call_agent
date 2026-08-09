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
    public class PersonasController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public PersonasController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Persona>>> GetPersonas()
        {
            return await _context.Personas.Include(p => p.KnowledgeBase).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Persona>> GetPersona(Guid id)
        {
            var persona = await _context.Personas.Include(p => p.KnowledgeBase).FirstOrDefaultAsync(p => p.Id == id);
            if (persona == null)
                return NotFound();
            return persona;
        }

        [HttpPost]
        public async Task<ActionResult<Persona>> CreatePersona(Persona persona)
        {
            _context.Personas.Add(persona);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPersona), new { id = persona.Id }, persona);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePersona(Guid id, Persona personaUpdates)
        {
            var persona = await _context.Personas.FindAsync(id);
            if (persona == null) return NotFound();

            persona.Name = personaUpdates.Name;
            persona.AvatarUrl = personaUpdates.AvatarUrl;
            persona.Description = personaUpdates.Description;
            persona.VoiceId = personaUpdates.VoiceId;
            persona.Language = personaUpdates.Language;
            persona.Provider = personaUpdates.Provider;
            persona.ModelName = personaUpdates.ModelName;
            persona.SystemPrompt = personaUpdates.SystemPrompt;
            persona.PersonalityJson = personaUpdates.PersonalityJson;
            persona.BehaviorRulesJson = personaUpdates.BehaviorRulesJson;
            persona.IsActive = personaUpdates.IsActive;
            persona.KnowledgeBaseId = personaUpdates.KnowledgeBaseId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePersona(Guid id)
        {
            var persona = await _context.Personas.FindAsync(id);
            if (persona == null) return NotFound();
            _context.Personas.Remove(persona);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
