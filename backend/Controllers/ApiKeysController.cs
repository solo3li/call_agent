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
using System.Security.Cryptography;
using System.Text;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ApiKeysController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApiKeysController(AppDbContext context)
        {
            _context = context;
        }

        public class CreateApiKeyDto
        {
            public string Name { get; set; } = string.Empty;
        }

        public class ApiKeyResponseDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
            public DateTime? LastUsedAt { get; set; }
        }

        public class ApiKeyCreatedResponseDto : ApiKeyResponseDto
        {
            public string RawKey { get; set; } = string.Empty;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiKeyResponseDto>>> GetApiKeys()
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var keys = await _context.ApiKeys
                .Where(k => k.TenantId == tenantId)
                .Select(k => new ApiKeyResponseDto
                {
                    Id = k.Id,
                    Name = k.Name,
                    CreatedAt = k.CreatedAt,
                    LastUsedAt = k.LastUsedAt
                })
                .ToListAsync();

            return Ok(keys);
        }

        [HttpPost]
        public async Task<ActionResult<ApiKeyCreatedResponseDto>> CreateApiKey([FromBody] CreateApiKeyDto dto)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            // Generate a secure random raw key
            var rawBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(rawBytes);
            }
            var rawKey = "sk_" + Convert.ToBase64String(rawBytes).Replace("+", "").Replace("/", "").Replace("=", "");

            // Hash the key for storage
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawKey));
            var keyHash = Convert.ToBase64String(hashBytes);

            var apiKey = new ApiKey
            {
                TenantId = tenantId,
                Name = dto.Name,
                KeyHash = keyHash
            };

            _context.ApiKeys.Add(apiKey);
            await _context.SaveChangesAsync();

            var response = new ApiKeyCreatedResponseDto
            {
                Id = apiKey.Id,
                Name = apiKey.Name,
                CreatedAt = apiKey.CreatedAt,
                RawKey = rawKey // Only returned once!
            };

            return CreatedAtAction(nameof(GetApiKeys), new { id = apiKey.Id }, response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteApiKey(Guid id)
        {
            var tenantIdStr = User.FindFirstValue("TenantId");
            if (!Guid.TryParse(tenantIdStr, out var tenantId))
                return Unauthorized();

            var apiKey = await _context.ApiKeys.FirstOrDefaultAsync(k => k.Id == id && k.TenantId == tenantId);
            if (apiKey == null)
                return NotFound();

            _context.ApiKeys.Remove(apiKey);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
