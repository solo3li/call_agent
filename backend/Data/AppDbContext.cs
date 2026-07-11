using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<AiAgent> Agents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Relationships
            modelBuilder.Entity<Tenant>()
                .HasMany(t => t.Agents)
                .WithOne(a => a.Tenant)
                .HasForeignKey(a => a.TenantId);
        }
    }
}
