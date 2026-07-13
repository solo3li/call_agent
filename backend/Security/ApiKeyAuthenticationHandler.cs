using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using backend.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace backend.Security
{
    public class ApiKeyAuthenticationOptions : AuthenticationSchemeOptions
    {
        public const string DefaultScheme = "ApiKey";
    }

    public class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationOptions>
    {
        private readonly AppDbContext _context;

        public ApiKeyAuthenticationHandler(
            IOptionsMonitor<ApiKeyAuthenticationOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            AppDbContext context)
            : base(options, logger, encoder)
        {
            _context = context;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (!Request.Headers.ContainsKey("Authorization"))
                return AuthenticateResult.NoResult();

            var authHeader = Request.Headers["Authorization"].ToString();
            if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return AuthenticateResult.NoResult();

            var rawKey = authHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(rawKey) || !rawKey.StartsWith("sk_"))
                return AuthenticateResult.NoResult();

            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawKey));
            var keyHash = Convert.ToBase64String(hashBytes);

            var apiKey = await _context.ApiKeys.FirstOrDefaultAsync(k => k.KeyHash == keyHash);
            if (apiKey == null)
                return AuthenticateResult.Fail("Invalid API Key.");

            // Update Last Used
            apiKey.LastUsedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, apiKey.Id.ToString()),
                new Claim("TenantId", apiKey.TenantId.ToString()),
                new Claim(ClaimTypes.Name, apiKey.Name)
            };

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
    }
}
