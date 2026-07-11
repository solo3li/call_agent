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
        private readonly AppDbContext _context;

        public WebhooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Webhook>>> GetWebhooks()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            return await _context.Webhooks.Where(w => w.TenantId == tenantId).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Webhook>> CreateWebhook(Webhook webhook)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            webhook.TenantId = tenantId;
            _context.Webhooks.Add(webhook);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWebhooks), new { id = webhook.Id }, webhook);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWebhook(Guid id, Webhook webhookUpdates)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var webhook = await _context.Webhooks.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId);
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
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var webhook = await _context.Webhooks.FirstOrDefaultAsync(w => w.Id == id && w.TenantId == tenantId);
            if (webhook == null)
                return NotFound();

            _context.Webhooks.Remove(webhook);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
