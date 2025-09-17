namespace WorldCupSimulator.Api.DTOs;

public class GroupStandingsResponse
{
    public int GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public List<TeamStandingResponse> Standings { get; set; } = new();
}

public class TeamStandingResponse
{
    public int TeamId { get; set; }
    public string TeamName { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string CountryCode { get; set; } = string.Empty;
    public int Elo { get; set; }
    public int Points { get; set; }
    public int MatchesPlayed { get; set; }
    public int Wins { get; set; }
    public int Draws { get; set; }
    public int Losses { get; set; }
    public int GoalsFor { get; set; }
    public int GoalsAgainst { get; set; }
    public int GoalDifference { get; set; }
    public int Position { get; set; }
}