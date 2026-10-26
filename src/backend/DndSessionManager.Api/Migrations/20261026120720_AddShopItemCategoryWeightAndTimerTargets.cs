using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShopItemCategoryWeightAndTimerTargets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "ShopItems",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                // Existing shop items predate categories (DM's list, 2026-10-26).
                defaultValue: "Miscellaneous");

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "ShopItems",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "GameTimerTargets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TimerId = table.Column<Guid>(type: "uuid", nullable: false),
                    CharacterId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameTimerTargets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameTimerTargets_Characters_CharacterId",
                        column: x => x.CharacterId,
                        principalTable: "Characters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameTimerTargets_GameTimers_TimerId",
                        column: x => x.TimerId,
                        principalTable: "GameTimers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameTimerTargets_CharacterId",
                table: "GameTimerTargets",
                column: "CharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_GameTimerTargets_TimerId_CharacterId",
                table: "GameTimerTargets",
                columns: new[] { "TimerId", "CharacterId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameTimerTargets");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "ShopItems");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "ShopItems");
        }
    }
}
