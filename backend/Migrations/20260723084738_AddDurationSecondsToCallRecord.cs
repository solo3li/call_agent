using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDurationSecondsToCallRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "CallRecords",
                newName: "DurationSeconds");

            migrationBuilder.RenameColumn(
                name: "Cost",
                table: "CallRecords",
                newName: "CostUsd");

            migrationBuilder.AddColumn<string>(
                name: "EventTypes",
                table: "Webhooks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SigningSecret",
                table: "Webhooks",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Transcript",
                table: "CallRecords",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "AiAgentId",
                table: "CallRecords",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "CallRecords",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                table: "CallRecords",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FreeSwitchUUID",
                table: "CallRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HangupCause",
                table: "CallRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomName",
                table: "CallRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sentiment",
                table: "CallRecords",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransferredTo",
                table: "CallRecords",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventTypes",
                table: "Webhooks");

            migrationBuilder.DropColumn(
                name: "SigningSecret",
                table: "Webhooks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "Direction",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "FreeSwitchUUID",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "HangupCause",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "RoomName",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "Sentiment",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "TransferredTo",
                table: "CallRecords");

            migrationBuilder.RenameColumn(
                name: "DurationSeconds",
                table: "CallRecords",
                newName: "Duration");

            migrationBuilder.RenameColumn(
                name: "CostUsd",
                table: "CallRecords",
                newName: "Cost");

            migrationBuilder.AlterColumn<string>(
                name: "Transcript",
                table: "CallRecords",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AiAgentId",
                table: "CallRecords",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
