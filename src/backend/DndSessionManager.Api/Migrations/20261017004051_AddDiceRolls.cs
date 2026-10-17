using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDiceRolls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DiceRolls",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GameId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnteredByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Expression = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Dice = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Total = table.Column<int>(type: "integer", nullable: false),
                    IsPhysical = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiceRolls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiceRolls_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DiceRolls_GameId_UserId_CreatedAt",
                table: "DiceRolls",
                columns: new[] { "GameId", "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DiceRolls");
        }
    }
}
