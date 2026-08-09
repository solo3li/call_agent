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
    public class ActionsController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public ActionsController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CallAction>>> GetActions()
        {
            return await _context.Actions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CallAction>> GetAction(Guid id)
        {
            var action = await _context.Actions.FindAsync(id);
            if (action == null) return NotFound();
            return action;
        }

        [HttpPost]
        public async Task<ActionResult<CallAction>> CreateAction(CallAction callAction)
        {
            _context.Actions.Add(callAction);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAction), new { id = callAction.Id }, callAction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAction(Guid id, CallAction updates)
        {
            var action = await _context.Actions.FindAsync(id);
            if (action == null) return NotFound();

            action.Name = updates.Name;
            action.Description = updates.Description;
            action.ConfigJson = updates.ConfigJson;
            action.IsActive = updates.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAction(Guid id)
        {
            var action = await _context.Actions.FindAsync(id);
            if (action == null) return NotFound();
            _context.Actions.Remove(action);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
