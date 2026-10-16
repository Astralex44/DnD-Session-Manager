using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnershipAndDropAccessLocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessLocks");

            migrationBuilder.AddColumn<Guid>(
                name: "AboutCharacterId",
                table: "Notes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                table: "Notes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                table: "Characters",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notes_AboutCharacterId",
                table: "Notes",
                column: "AboutCharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_GameId_OwnerUserId",
                table: "Notes",
                columns: new[] { "GameId", "OwnerUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_OwnerUserId",
                table: "Notes",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Characters_OwnerUserId",
                table: "Characters",
                column: "OwnerUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Characters_Users_OwnerUserId",
                table: "Characters",
                column: "OwnerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Characters_AboutCharacterId",
                table: "Notes",
                column: "AboutCharacterId",
                principalTable: "Characters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Users_OwnerUserId",
                table: "Notes",
                column: "OwnerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Characters_Users_OwnerUserId",
                table: "Characters");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Characters_AboutCharacterId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Users_OwnerUserId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_AboutCharacterId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_GameId_OwnerUserId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_OwnerUserId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Characters_OwnerUserId",
                table: "Characters");

            migrationBuilder.DropColumn(
                name: "AboutCharacterId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Characters");

            migrationBuilder.CreateTable(
                name: "AccessLocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    CodeHash = table.Column<string>(type: "text", nullable: false),
                    CodeSalt = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResourceKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ResourceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessLocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccessLocks_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessLocks_GameId_ResourceType_ResourceKey",
                table: "AccessLocks",
                columns: new[] { "GameId", "ResourceType", "ResourceKey" },
                unique: true);
        }
    }
}
