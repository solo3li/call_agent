using System;

namespace backend.Services
{
    public interface ITenantProvider
    {
        string GetCurrentSchema();
        Guid GetCurrentTenantId();
        void SetTenantInfo(string schema, Guid tenantId);
    }

    public class TenantProvider : ITenantProvider
    {
        private string _schema = string.Empty;
        private Guid _tenantId = Guid.Empty;

        public string GetCurrentSchema() => _schema;
        public Guid GetCurrentTenantId() => _tenantId;

        public void SetTenantInfo(string schema, Guid tenantId)
        {
            _schema = schema;
            _tenantId = tenantId;
        }
    }
}
