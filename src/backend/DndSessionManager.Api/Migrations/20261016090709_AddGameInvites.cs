using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGameInvites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DiscordHandle",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "GameInvites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    DiscordHandle = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameInvites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameInvites_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameInvites_GameId_DiscordHandle",
                table: "GameInvites",
                columns: new[] { "GameId", "DiscordHandle" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameInvites");

            migrationBuilder.DropColumn(
                name: "DiscordHandle",
                table: "Users");
        }
    }
}
