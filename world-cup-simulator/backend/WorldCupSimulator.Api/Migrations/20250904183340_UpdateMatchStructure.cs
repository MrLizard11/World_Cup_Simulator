using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorldCupSimulator.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMatchStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FinalStageId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatchType",
                table: "Matches",
                type: "nvarchar(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PenaltyScoreA",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PenaltyScoreB",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuarterFinalsStageId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Round",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoundOf16StageId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SemiFinalsStageId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThirdPlaceStageId",
                table: "Matches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WentToPenalties",
                table: "Matches",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Winner",
                table: "Matches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "KnockoutStages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ThirdPlaceMatchId = table.Column<int>(type: "int", nullable: true),
                    FinalMatchId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnockoutStages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Matches_FinalStageId",
                table: "Matches",
                column: "FinalStageId",
                unique: true,
                filter: "[FinalStageId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_QuarterFinalsStageId",
                table: "Matches",
                column: "QuarterFinalsStageId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_RoundOf16StageId",
                table: "Matches",
                column: "RoundOf16StageId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_SemiFinalsStageId",
                table: "Matches",
                column: "SemiFinalsStageId");

            migrationBuilder.CreateIndex(
                name: "IX_Matches_ThirdPlaceStageId",
                table: "Matches",
                column: "ThirdPlaceStageId",
                unique: true,
                filter: "[ThirdPlaceStageId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_KnockoutStages_FinalStageId",
                table: "Matches",
                column: "FinalStageId",
                principalTable: "KnockoutStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_KnockoutStages_QuarterFinalsStageId",
                table: "Matches",
                column: "QuarterFinalsStageId",
                principalTable: "KnockoutStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_KnockoutStages_RoundOf16StageId",
                table: "Matches",
                column: "RoundOf16StageId",
                principalTable: "KnockoutStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_KnockoutStages_SemiFinalsStageId",
                table: "Matches",
                column: "SemiFinalsStageId",
                principalTable: "KnockoutStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Matches_KnockoutStages_ThirdPlaceStageId",
                table: "Matches",
                column: "ThirdPlaceStageId",
                principalTable: "KnockoutStages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matches_KnockoutStages_FinalStageId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_KnockoutStages_QuarterFinalsStageId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_KnockoutStages_RoundOf16StageId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_KnockoutStages_SemiFinalsStageId",
                table: "Matches");

            migrationBuilder.DropForeignKey(
                name: "FK_Matches_KnockoutStages_ThirdPlaceStageId",
                table: "Matches");

            migrationBuilder.DropTable(
                name: "KnockoutStages");

            migrationBuilder.DropIndex(
                name: "IX_Matches_FinalStageId",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_QuarterFinalsStageId",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_RoundOf16StageId",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_SemiFinalsStageId",
                table: "Matches");

            migrationBuilder.DropIndex(
                name: "IX_Matches_ThirdPlaceStageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "FinalStageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "MatchType",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "PenaltyScoreA",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "PenaltyScoreB",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "QuarterFinalsStageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Round",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "RoundOf16StageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "SemiFinalsStageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "ThirdPlaceStageId",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "WentToPenalties",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "Winner",
                table: "Matches");
        }
    }
}
