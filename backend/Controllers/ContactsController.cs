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
    public class ContactsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactsController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetTenantId()
        {
            var tenantIdString = User.FindFirstValue("tenantId");
            if (string.IsNullOrEmpty(tenantIdString))
            {
                throw new UnauthorizedAccessException("Tenant ID missing from token.");
            }
            return Guid.Parse(tenantIdString);
        }

        [HttpGet]
        public async Task<IActionResult> GetContacts()
        {
            var tenantId = GetTenantId();
            var contacts = await _context.Contacts
                .Where(c => c.TenantId == tenantId)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(contacts);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContact([FromBody] Contact contactDto)
        {
            var tenantId = GetTenantId();

            var newContact = new Contact
            {
                TenantId = tenantId,
                Name = contactDto.Name,
                Extension = contactDto.Extension,
                Department = contactDto.Department,
                Status = "Offline"
            };

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            return Ok(newContact);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(Guid id)
        {
            var tenantId = GetTenantId();
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId);

            if (contact == null)
            {
                return NotFound();
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Contact deleted successfully." });
        }
    }
}
