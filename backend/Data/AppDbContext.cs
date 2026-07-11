using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<AiAgent> Agents { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ApiKey> ApiKeys { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Relationships
            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Agents)
                .WithOne(a => a.Tenant)
                .HasForeignKey(a => a.TenantId);
                
            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Users)
                .WithOne(u => u.Tenant)
                .HasForeignKey(u => u.TenantId);
                
            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.ApiKeys)
                .WithOne(k => k.Tenant)
                .HasForeignKey(k => k.TenantId);
        }
    }
}
