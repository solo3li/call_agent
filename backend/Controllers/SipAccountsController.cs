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
    public class SipAccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SipAccountsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SipAccount>>> GetSipAccounts()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var accounts = await _context.SipAccounts
                .Where(s => s.TenantId == tenantId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(accounts);
        }

        [HttpPost]
        public async Task<ActionResult<SipAccount>> CreateSipAccount()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var random = new Random();
            var username = "ext" + random.Next(1000, 9999).ToString();
            var password = Guid.NewGuid().ToString("N").Substring(0, 12);
            var domain = "cpaas.178.62.192.74.nip.io"; // External IP or domain for the SIP server

            var sipAccount = new SipAccount
            {
                TenantId = tenantId,
                Username = username,
                Password = password,
                Domain = domain
            };

            _context.SipAccounts.Add(sipAccount);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSipAccounts), new { id = sipAccount.Id }, sipAccount);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSipAccount(Guid id)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var sipAccount = await _context.SipAccounts.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId);
            if (sipAccount == null)
                return NotFound();

            _context.SipAccounts.Remove(sipAccount);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
