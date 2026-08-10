using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.Extensions.Configuration;
using System;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly SharedDbContext _sharedDb;
        private readonly TenantDbContext _tenantDb;
        private readonly ITenantProvider _tenantProvider;
        private readonly IConfiguration _configuration;

        public AuthController(
            SharedDbContext sharedDb, 
            TenantDbContext tenantDb,
            ITenantProvider tenantProvider,
            IConfiguration configuration)
        {
            _sharedDb = sharedDb;
            _tenantDb = tenantDb;
            _tenantProvider = tenantProvider;
            _configuration = configuration;
        }

        public class RegisterDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string TenantName { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Create a unique schema name for the new tenant
            var schemaName = "tenant_" + Guid.NewGuid().ToString("N").Substring(0, 12);
            
            var tenant = new Tenant 
            { 
                Name = string.IsNullOrEmpty(dto.TenantName) ? dto.Email : dto.TenantName,
                SchemaName = schemaName
            };
            
            _sharedDb.Tenants.Add(tenant);
            await _sharedDb.SaveChangesAsync();

            // Create schema
            await _sharedDb.Database.ExecuteSqlRawAsync($"CREATE SCHEMA \"{schemaName}\"");

            // Switch context to the new tenant's schema
            _tenantProvider.SetTenantInfo(schemaName, tenant.Id);
            
            // Apply migrations for this tenant's schema
            var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
            optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"), x => 
            {
                x.MigrationsHistoryTable("__EFMigrationsHistory", schemaName);
            });
            optionsBuilder.EnableServiceProviderCaching(false);
            optionsBuilder.AddInterceptors(new SchemaInterceptor(schemaName));
            
            using (var newTenantDb = new TenantDbContext(optionsBuilder.Options, _tenantProvider, _configuration))
            {
                await newTenantDb.Database.MigrateAsync();

                var user = new User
                {
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
                };
                
                newTenantDb.Users.Add(user);
                await newTenantDb.SaveChangesAsync();
            }

            return Ok(new { message = "User registered successfully", tenantId = tenant.Id });
        }

        public class LoginDto
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public Guid? TenantId { get; set; }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // If TenantId is explicitly provided in the request, use it to switch schema
            if (dto.TenantId.HasValue)
            {
                var tenant = await _sharedDb.Tenants.FindAsync(dto.TenantId.Value);
                if (tenant != null)
                {
                    _tenantProvider.SetTenantInfo(tenant.SchemaName, tenant.Id);
                }
            }

            var currentSchema = _tenantProvider.GetCurrentSchema();
            var currentTenantId = _tenantProvider.GetCurrentTenantId();

            if (string.IsNullOrEmpty(currentSchema) || currentSchema == "public")
            {
                // Find tenant by querying all schemas
                var tenants = await _sharedDb.Tenants.ToListAsync();
                foreach (var t in tenants)
                {
                    try
                    {
                        // Use raw ADO.NET to check if user exists in this schema
                        using (var command = _sharedDb.Database.GetDbConnection().CreateCommand())
                        {
                            command.CommandText = $"SELECT COUNT(1) FROM \"{t.SchemaName}\".\"Users\" WHERE \"Email\" = @email";
                            var param = command.CreateParameter();
                            param.ParameterName = "@email";
                            param.Value = dto.Email;
                            command.Parameters.Add(param);

                            if (command.Connection.State != System.Data.ConnectionState.Open)
                                await command.Connection.OpenAsync();

                            var result = await command.ExecuteScalarAsync();
                            if (result != null && Convert.ToInt32(result) > 0)
                            {
                                _tenantProvider.SetTenantInfo(t.SchemaName, t.Id);
                                currentSchema = t.SchemaName;
                                currentTenantId = t.Id;
                                break;
                            }
                        }
                    }
                    catch
                    {
                        // Ignore schemas that might not have Users table yet
                    }
                }

                if (string.IsNullOrEmpty(currentSchema) || currentSchema == "public")
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }
            }

            var user = await _tenantDb.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
            {
                throw new InvalidOperationException("Jwt:Key is missing or too short. A secure 32+ byte key must be configured.");
            }
            
            var key = Encoding.ASCII.GetBytes(jwtKey);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim("TenantId", currentTenantId.ToString()),
                    new Claim("TenantSchema", currentSchema)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _configuration["Jwt:Issuer"] ?? "cpaas-auth",
                Audience = _configuration["Jwt:Audience"] ?? "cpaas-frontend"
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Ok(new { token = tokenHandler.WriteToken(token), tenantId = currentTenantId });
        }
    }
}
