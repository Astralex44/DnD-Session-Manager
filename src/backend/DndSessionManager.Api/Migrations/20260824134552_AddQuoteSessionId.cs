using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DndSessionManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuoteSessionId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SessionId",
                table: "Quotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_SessionId",
                table: "Quotes",
                column: "SessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Sessions_SessionId",
                table: "Quotes",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Sessions_SessionId",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_SessionId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Quotes");
        }
    }
}
