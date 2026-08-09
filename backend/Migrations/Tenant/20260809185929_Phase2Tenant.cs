using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class Phase2Tenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Dialect",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "Emotion",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "FallbackNumber",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "ModelName",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "PromptContext",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "SpeakingStyle",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "VoiceId",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "WelcomeMessage",
                table: "Agents");

            migrationBuilder.AddColumn<Guid>(
                name: "PersonaId",
                table: "CallRecords",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Agents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PersonaId",
                table: "Agents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Actions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ConfigJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KnowledgeBases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SourceType = table.Column<string>(type: "text", nullable: false),
                    SourceUrl = table.Column<string>(type: "text", nullable: false),
                    IsProcessed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeBases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ActionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CallId = table.Column<Guid>(type: "uuid", nullable: false),
                    InputJson = table.Column<string>(type: "text", nullable: false),
                    OutputJson = table.Column<string>(type: "text", nullable: false),
                    DurationMs = table.Column<int>(type: "integer", nullable: false),
                    Success = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CallActionId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActionLogs_Actions_CallActionId",
                        column: x => x.CallActionId,
                        principalTable: "Actions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActionLogs_CallRecords_CallId",
                        column: x => x.CallId,
                        principalTable: "CallRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    VoiceId = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    ModelName = table.Column<string>(type: "text", nullable: false),
                    SystemPrompt = table.Column<string>(type: "text", nullable: false),
                    PersonalityJson = table.Column<string>(type: "text", nullable: false),
                    BehaviorRulesJson = table.Column<string>(type: "text", nullable: false),
                    KnowledgeBaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Personas_KnowledgeBases_KnowledgeBaseId",
                        column: x => x.KnowledgeBaseId,
                        principalTable: "KnowledgeBases",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CallRecords_PersonaId",
                table: "CallRecords",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_Agents_PersonaId",
                table: "Agents",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogs_CallActionId",
                table: "ActionLogs",
                column: "CallActionId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogs_CallId",
                table: "ActionLogs",
                column: "CallId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_KnowledgeBaseId",
                table: "Personas",
                column: "KnowledgeBaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Agents_Personas_PersonaId",
                table: "Agents",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_CallRecords_Personas_PersonaId",
                table: "CallRecords",
                column: "PersonaId",
                principalTable: "Personas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Agents_Personas_PersonaId",
                table: "Agents");

            migrationBuilder.DropForeignKey(
                name: "FK_CallRecords_Personas_PersonaId",
                table: "CallRecords");

            migrationBuilder.DropTable(
                name: "ActionLogs");

            migrationBuilder.DropTable(
                name: "Personas");

            migrationBuilder.DropTable(
                name: "Actions");

            migrationBuilder.DropTable(
                name: "KnowledgeBases");

            migrationBuilder.DropIndex(
                name: "IX_CallRecords_PersonaId",
                table: "CallRecords");

            migrationBuilder.DropIndex(
                name: "IX_Agents_PersonaId",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "PersonaId",
                table: "CallRecords");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "PersonaId",
                table: "Agents");

            migrationBuilder.AddColumn<string>(
                name: "Dialect",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Emotion",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FallbackNumber",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ModelName",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PromptContext",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SpeakingStyle",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VoiceId",
                table: "Agents",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WelcomeMessage",
                table: "Agents",
                type: "text",
                nullable: true);
        }
    }
}
