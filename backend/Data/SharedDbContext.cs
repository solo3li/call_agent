using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class SharedDbContext : DbContext
    {
        public SharedDbContext(DbContextOptions<SharedDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<TenantDomain> TenantDomains { get; set; }
        
        // Expose shared tables for migrations
        public DbSet<PhoneNumber> PhoneNumbers { get; set; }
        public DbSet<ApiKey> ApiKeys { get; set; }
        public DbSet<MarketplacePersona> MarketplacePersonas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<TenantDomain>()
                .HasOne(td => td.Tenant)
                .WithMany()
                .HasForeignKey(td => td.TenantId);
        }
    }
}
