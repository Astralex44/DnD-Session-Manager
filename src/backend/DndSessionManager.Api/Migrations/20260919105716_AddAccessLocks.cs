using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessLocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccessLocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ResourceKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CodeHash = table.Column<string>(type: "text", nullable: false),
                    CodeSalt = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessLocks");
        }
    }
}
