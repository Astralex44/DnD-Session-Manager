using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuoteCharacterId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CharacterId",
                table: "Quotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_CharacterId",
                table: "Quotes",
                column: "CharacterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Characters_CharacterId",
                table: "Quotes",
                column: "CharacterId",
                principalTable: "Characters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Characters_CharacterId",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_CharacterId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "CharacterId",
                table: "Quotes");
        }
    }
}
