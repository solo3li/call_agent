using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Services;

namespace backend.Data
{
    public class TenantDbContext : DbContext
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _configuration;

        public TenantDbContext(DbContextOptions<TenantDbContext> options, ITenantProvider tenantProvider, Microsoft.Extensions.Configuration.IConfiguration configuration) : base(options) 
        {
            _tenantProvider = tenantProvider;
            _configuration = configuration;
        }

        public DbSet<AiAgent> Agents { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Webhook> Webhooks { get; set; }
        public DbSet<CallRecord> CallRecords { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        
        // Phase 2 Entities
        public DbSet<Persona> Personas { get; set; }
        public DbSet<KnowledgeBase> KnowledgeBases { get; set; }
        public DbSet<CallAction> Actions { get; set; }
        public DbSet<CallActionLog> ActionLogs { get; set; }
        public DbSet<SipAccount> SipAccounts { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
            var schema = _tenantProvider.GetCurrentSchema();
            
            if (!string.IsNullOrEmpty(schema) && schema != "public")
            {
                optionsBuilder.AddInterceptors(new SchemaInterceptor(schema));
            }

            var connStr = _configuration.GetConnectionString("DefaultConnection");
            optionsBuilder.UseNpgsql(connStr, x => 
            {
                if (!string.IsNullOrEmpty(schema) && schema != "public")
                {
                    x.MigrationsHistoryTable("__EFMigrationsHistory", schema);
                }
            });
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Exclude shared tables from Tenant migrations since they are managed by SharedDbContext
            modelBuilder.Entity<Tenant>().ToTable("tenants", "public", t => t.ExcludeFromMigrations());
            modelBuilder.Entity<PhoneNumber>().ToTable("phone_numbers", "public", t => t.ExcludeFromMigrations());
            modelBuilder.Entity<ApiKey>().ToTable("api_keys", "public", t => t.ExcludeFromMigrations());
            modelBuilder.Entity<TenantDomain>().ToTable("tenant_domains", "public", t => t.ExcludeFromMigrations());

            modelBuilder.Entity<AiAgent>()
                .HasMany(a => a.CallRecords)
                .WithOne(c => c.AiAgent)
                .HasForeignKey(c => c.AiAgentId)
                .OnDelete(DeleteBehavior.Restrict);
                
        }
    }
}
