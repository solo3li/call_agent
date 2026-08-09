using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class Phase6_7Tenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActionLogs_Actions_CallActionId",
                table: "ActionLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ActionLogs_CallRecords_CallId",
                table: "ActionLogs");

            migrationBuilder.RenameColumn(
                name: "CallId",
                table: "ActionLogs",
                newName: "CallRecordId");

            migrationBuilder.RenameIndex(
                name: "IX_ActionLogs_CallId",
                table: "ActionLogs",
                newName: "IX_ActionLogs_CallRecordId");

            migrationBuilder.AlterColumn<Guid>(
                name: "CallActionId",
                table: "ActionLogs",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "ActionId",
                table: "ActionLogs",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<string>(
                name: "ActionName",
                table: "ActionLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_ActionLogs_Actions_CallActionId",
                table: "ActionLogs",
                column: "CallActionId",
                principalTable: "Actions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ActionLogs_CallRecords_CallRecordId",
                table: "ActionLogs",
                column: "CallRecordId",
                principalTable: "CallRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SipAccounts_Users_UserId",
                table: "SipAccounts",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActionLogs_Actions_CallActionId",
                table: "ActionLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ActionLogs_CallRecords_CallRecordId",
                table: "ActionLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_SipAccounts_Users_UserId",
                table: "SipAccounts");

            migrationBuilder.DropColumn(
                name: "ActionName",
                table: "ActionLogs");

            migrationBuilder.RenameColumn(
                name: "CallRecordId",
                table: "ActionLogs",
                newName: "CallId");

            migrationBuilder.RenameIndex(
                name: "IX_ActionLogs_CallRecordId",
                table: "ActionLogs",
                newName: "IX_ActionLogs_CallId");

            migrationBuilder.AlterColumn<Guid>(
                name: "CallActionId",
                table: "ActionLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ActionId",
                table: "ActionLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ActionLogs_Actions_CallActionId",
                table: "ActionLogs",
                column: "CallActionId",
                principalTable: "Actions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActionLogs_CallRecords_CallId",
                table: "ActionLogs",
                column: "CallId",
                principalTable: "CallRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
