using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using backend.Data;
using backend.Services;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, SharedDbContext sharedDb, ITenantProvider tenantProvider, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            var isSingleTenant = configuration["DEPLOYMENT_MODE"] == "single_tenant";

            // 1. Check for TenantInfo from JWT claims first (for API calls)
            if (context.User.Identity?.IsAuthenticated == true && !isSingleTenant)
            {
                var schemaClaim = context.User.FindFirst("TenantSchema")?.Value;
                var tenantIdClaim = context.User.FindFirst("TenantId")?.Value;
                
                if (!string.IsNullOrEmpty(schemaClaim) && Guid.TryParse(tenantIdClaim, out var tenantId))
                {
                    tenantProvider.SetTenantInfo(schemaClaim, tenantId);
                    await _next(context);
                    return;
                }
            }

            if (isSingleTenant)
            {
                var defaultTenant = await sharedDb.Tenants.OrderBy(t => t.CreatedAt).FirstOrDefaultAsync();
                if (defaultTenant != null)
                {
                    tenantProvider.SetTenantInfo(defaultTenant.SchemaName, defaultTenant.Id);
                }
                await _next(context);
                return;
            }

            // 2. Fallback to Host header (for login / domain-based resolution)
            var host = context.Request.Host.Host; // e.g. "company-x.cpaas.com" or "localhost"

            var tenantDomain = await sharedDb.TenantDomains
                .Include(td => td.Tenant)
                .FirstOrDefaultAsync(td => td.Hostname == host);

            if (tenantDomain != null && tenantDomain.Tenant != null && tenantDomain.Tenant.IsActive)
            {
                tenantProvider.SetTenantInfo(tenantDomain.Tenant.SchemaName, tenantDomain.TenantId);
            }
            else
            {
                // Fallback for local development or default routing
                // In production, you might want to return 404 or redirect to a default landing page
                var defaultTenant = await sharedDb.Tenants.OrderBy(t => t.CreatedAt).FirstOrDefaultAsync();
                if (defaultTenant != null)
                {
                    tenantProvider.SetTenantInfo(defaultTenant.SchemaName, defaultTenant.Id);
                }
            }

            await _next(context);
        }
    }
}
