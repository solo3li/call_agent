using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Shared
{
    /// <inheritdoc />
    public partial class Phase6_7Shared : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "sip_accounts",
                schema: "public");

            migrationBuilder.AddColumn<string>(
                name: "BrandingJson",
                schema: "public",
                table: "tenants",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomDomain",
                schema: "public",
                table: "tenants",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BrandingJson",
                schema: "public",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "CustomDomain",
                schema: "public",
                table: "tenants");

            migrationBuilder.CreateTable(
                name: "sip_accounts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Domain = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sip_accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sip_accounts_tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sip_accounts_TenantId",
                schema: "public",
                table: "sip_accounts",
                column: "TenantId");
        }
    }
}
