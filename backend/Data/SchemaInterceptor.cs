using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace backend.Data
{
    public class SchemaInterceptor : DbConnectionInterceptor
    {
        private readonly string _schema;

        public SchemaInterceptor(string schema)
        {
            _schema = schema;
        }

        public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
        {
            base.ConnectionOpened(connection, eventData);
            SetSearchPath(connection);
        }

        public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
        {
            await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
            await SetSearchPathAsync(connection, cancellationToken);
        }

        private void SetSearchPath(DbConnection connection)
        {
            var safeSchema = _schema.Replace("\"", "\"\"");
            using var command = connection.CreateCommand();
            command.CommandText = $"SET search_path TO \"{safeSchema}\"";
            command.ExecuteNonQuery();
        }

        private async Task SetSearchPathAsync(DbConnection connection, CancellationToken cancellationToken)
        {
            var safeSchema = _schema.Replace("\"", "\"\"");
            using var command = connection.CreateCommand();
            command.CommandText = $"SET search_path TO \"{safeSchema}\"";
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
    }
}
