namespace WorldCupSimulator.Api.Models;

public class GroupTeam
{
    public int GroupId { get; set; }
    public int TeamId { get; set; }
    public int Points { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
    public int GoalDifference { get; set; }

    // Navigation properties
    public Group Group { get; set; } = null!;
    public Team Team { get; set; } = null!;
}
