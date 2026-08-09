using System;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public interface ILicenseService
    {
        bool IsValid { get; }
        int MaxCalls { get; }
        int MaxAgents { get; }
        DateTime ExpiryDate { get; }
        bool IsAirGapped { get; }
        string GetValidationMessage();
        bool CheckCallLimit(int currentCalls);
        bool CheckAgentLimit(int currentAgents);
    }

    public class LicenseService : ILicenseService
    {
        private readonly ILogger<LicenseService> _logger;
        private readonly string? _licenseKey;
        private bool _isValid = false;
        private string _validationMessage = "License not initialized";

        public int MaxCalls { get; private set; } = 0;
        public int MaxAgents { get; private set; } = 0;
        public DateTime ExpiryDate { get; private set; } = DateTime.MinValue;
        public bool IsAirGapped { get; private set; } = false;

        public bool IsValid => _isValid;

        public LicenseService(IConfiguration configuration, ILogger<LicenseService> logger)
        {
            _logger = logger;
            _licenseKey = configuration["LICENSE_KEY"];
            
            // In single_tenant mode, licensing is mandatory.
            var mode = configuration["DEPLOYMENT_MODE"];
            if (mode == "single_tenant")
            {
                ValidateLicense();
            }
            else
            {
                // Multi-tenant SaaS mode doesn't strictly require this local license key 
                // because billing is managed externally per tenant.
                _isValid = true;
                _validationMessage = "Running in SaaS mode (no local license required)";
            }
        }

        private void ValidateLicense()
        {
            if (string.IsNullOrEmpty(_licenseKey))
            {
                _validationMessage = "LICENSE_KEY is missing";
                _isValid = false;
                return;
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                
                // For a real enterprise system, we would validate the signature against 
                // a public key embedded in the binary. For now, we decode to read claims.
                var token = handler.ReadJwtToken(_licenseKey);

                if (token.ValidTo < DateTime.UtcNow)
                {
                    _validationMessage = "License expired";
                    _isValid = false;
                    return;
                }

                ExpiryDate = token.ValidTo;
                
                // Extract custom claims
                if (int.TryParse(GetClaim(token, "max_calls"), out var calls)) MaxCalls = calls;
                if (int.TryParse(GetClaim(token, "max_agents"), out var agents)) MaxAgents = agents;
                if (bool.TryParse(GetClaim(token, "air_gapped"), out var airGapped)) IsAirGapped = airGapped;

                _isValid = true;
                _validationMessage = "License is valid";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to parse LICENSE_KEY");
                _validationMessage = "Invalid license format";
                _isValid = false;
            }
        }

        private string? GetClaim(JwtSecurityToken token, string claimType)
        {
            var claim = token.Claims.FirstOrDefault(c => c.Type == claimType);
            return claim?.Value;
        }

        public string GetValidationMessage() => _validationMessage;

        public bool CheckCallLimit(int currentCalls)
        {
            if (!IsValid) return false;
            if (MaxCalls == 0) return true; // 0 = unlimited
            return currentCalls < MaxCalls;
        }

        public bool CheckAgentLimit(int currentAgents)
        {
            if (!IsValid) return false;
            if (MaxAgents == 0) return true; // 0 = unlimited
            return currentAgents < MaxAgents;
        }
    }
}
