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
        private readonly TenantDbContext _context;

        public SipAccountsController(TenantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SipAccount>>> GetSipAccounts()
        {
            var accounts = await _context.SipAccounts
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(accounts);
        }

        [HttpPost]
        public async Task<ActionResult<SipAccount>> CreateSipAccount()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId)) 
            {
                return Unauthorized(new { message = "Invalid user token" });
            }

            var random = new Random();
            var extension = "1" + random.Next(100, 999).ToString();
            var password = Guid.NewGuid().ToString("N").Substring(0, 12);

            var sipAccount = new SipAccount
            {
                UserId = userId,
                Extension = extension,
                PasswordEnc = password,
                Type = "agent"
            };

            _context.SipAccounts.Add(sipAccount);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSipAccounts), new { id = sipAccount.Id }, sipAccount);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSipAccount(Guid id)
        {
            var sipAccount = await _context.SipAccounts.FirstOrDefaultAsync(s => s.Id == id);
            if (sipAccount == null)
                return NotFound();

            _context.SipAccounts.Remove(sipAccount);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
