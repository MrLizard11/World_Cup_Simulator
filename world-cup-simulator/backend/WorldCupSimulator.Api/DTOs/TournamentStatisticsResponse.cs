namespace WorldCupSimulator.Api.DTOs;

public class TournamentStatisticsResponse
{
    public int TotalGoals { get; set; }
    public double AverageGoalsPerMatch { get; set; }
    public BiggestWinResponse BiggestWin { get; set; } = new();
    public int PenaltyShootouts { get; set; }
    public MostGoalsMatchResponse MostGoalsInMatch { get; set; } = new();
    public int TotalMatches { get; set; }
    public int CompletedMatches { get; set; }
}