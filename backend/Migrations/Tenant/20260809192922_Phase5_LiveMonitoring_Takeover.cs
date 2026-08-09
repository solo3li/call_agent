using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class Phase5_LiveMonitoring_Takeover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TransferredTo",
                table: "CallRecords",
                newName: "transferred_to");

            migrationBuilder.RenameColumn(
                name: "RecordingUrl",
                table: "CallRecords",
                newName: "recording_url");

            migrationBuilder.AddColumn<Guid>(
                name: "AgentId",
                table: "CallRecords",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "supervisor_takeover_at",
                table: "CallRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CallRecords_AgentId",
                table: "CallRecords",
                column: "AgentId");

            migrationBuilder.AddForeignKey(
                name: "FK_CallRecords_Agents_AgentId",
                table: "CallRecords",
                column: "AgentId",
                principalTable: "Agents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CallRecords_Agents_AgentId",
                table: "CallRecords");

            migrationBuilder.DropIndex(
                name: "IX_CallRecords_AgentId",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "AgentId",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "supervisor_takeover_at",
                table: "CallRecords");

            migrationBuilder.RenameColumn(
                name: "transferred_to",
                table: "CallRecords",
                newName: "TransferredTo");

            migrationBuilder.RenameColumn(
                name: "recording_url",
                table: "CallRecords",
                newName: "RecordingUrl");
        }
    }
}
