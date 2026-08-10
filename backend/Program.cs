using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DotNetEnv;

// Load .env file from the root of the project
Env.Load(Path.Combine(Directory.GetCurrentDirectory(), "../.env"));

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
var allowedOriginsStr = builder.Configuration["ALLOWED_ORIGINS"];
var allowedOrigins = string.IsNullOrEmpty(allowedOriginsStr) 
    ? new[] { "http://localhost:3000" } 
    : allowedOriginsStr.Split(',', StringSplitOptions.RemoveEmptyEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});


// Removed Google and Alibaba AI Services as they are now handled by the Golang Agent

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<SharedDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDbContext<TenantDbContext>();

builder.Services.AddScoped<backend.Services.ITenantProvider, backend.Services.TenantProvider>();
builder.Services.AddSingleton<backend.Services.ILicenseService, backend.Services.LicenseService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_fallback_key_that_is_at_least_32_bytes_long";
var key = Encoding.ASCII.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddScheme<backend.Security.ApiKeyAuthenticationOptions, backend.Security.ApiKeyAuthenticationHandler>("ApiKey", null)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "cpaas-auth",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "cpaas-frontend",
        ValidateLifetime = true
    };
    
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.ContainsKey("token"))
            {
                context.Token = context.Request.Cookies["token"];
            }
            return Task.CompletedTask;
        }
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.MapScalarApiReference();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthentication();

// Add Multi-Tenant Middleware
app.UseMiddleware<backend.Middleware.TenantMiddleware>();

app.UseAuthorization();
app.MapControllers();

// Auto Migrate Shared Database
using (var scope = app.Services.CreateScope())
{
    var sharedDb = scope.ServiceProvider.GetRequiredService<SharedDbContext>();
    sharedDb.Database.Migrate();
}

app.Run();
