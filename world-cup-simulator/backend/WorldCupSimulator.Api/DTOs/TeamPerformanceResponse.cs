namespace WorldCupSimulator.Api.DTOs;

public class TeamPerformanceResponse
{
    public TeamResponse Team { get; set; } = null!;
    public string FinalPosition { get; set; } = string.Empty;
    public int MatchesPlayed { get; set; }
    public int GoalsScored { get; set; }
    public int GoalsConceded { get; set; }
    public int GoalDifference { get; set; }
    public List<string> Path { get; set; } = new();
}