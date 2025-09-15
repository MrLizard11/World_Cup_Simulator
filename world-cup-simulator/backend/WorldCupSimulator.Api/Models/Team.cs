namespace WorldCupSimulator.Api.Models;

public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int Elo { get; set; }
    public string CountryCode { get; set; } = string.Empty;

    // Navigation properties
    public ICollection<GroupTeam> GroupTeams { get; set; } = new List<GroupTeam>();
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
