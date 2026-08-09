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
    public class WebhooksController : ControllerBase
    {
        private readonly TenantDbContext _context;

        public WebhooksController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Webhook>>> GetWebhooks()
        {
            return await _context.Webhooks.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Webhook>> CreateWebhook(Webhook webhook)
        {
            _context.Webhooks.Add(webhook);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWebhooks), new { id = webhook.Id }, webhook);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWebhook(Guid id, Webhook webhookUpdates)
        {
            var webhook = await _context.Webhooks.FirstOrDefaultAsync(w => w.Id == id);
            if (webhook == null)
                return NotFound();

            webhook.Name = webhookUpdates.Name;
            webhook.PayloadUrl = webhookUpdates.PayloadUrl;
            webhook.IsActive = webhookUpdates.IsActive;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWebhook(Guid id)
        {
            var webhook = await _context.Webhooks.FirstOrDefaultAsync(w => w.Id == id);
            if (webhook == null)
                return NotFound();

            _context.Webhooks.Remove(webhook);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
