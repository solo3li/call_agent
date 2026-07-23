using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue("id") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString))
            {
                throw new UnauthorizedAccessException("User ID missing from token.");
            }
            return Guid.Parse(userIdString);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetUserId();
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new {
                user.Id,
                user.Email,
                user.DndStatus,
                user.ForwardingEnabled,
                user.ForwardingNumber
            });
        }

        public class UpdateSettingsDto
        {
            public bool DndStatus { get; set; }
            public bool ForwardingEnabled { get; set; }
            public string ForwardingNumber { get; set; } = string.Empty;
        }

        [HttpPut("me/settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsDto dto)
        {
            var userId = GetUserId();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            user.DndStatus = dto.DndStatus;
            user.ForwardingEnabled = dto.ForwardingEnabled;
            user.ForwardingNumber = dto.ForwardingNumber;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Settings updated successfully" });
        }
    }
}
