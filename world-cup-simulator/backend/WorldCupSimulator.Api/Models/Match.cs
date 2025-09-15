namespace WorldCupSimulator.Api.Models;

public abstract class Match
{
    public int Id { get; set; }
    public int? GroupId { get; set; }
    public int TeamAId { get; set; }
    public int TeamBId { get; set; }
    public int ScoreA { get; set; }
    public int ScoreB { get; set; }
    public bool Played { get; set; }

    // Discriminator field for EF Core inheritance
    public string MatchType { get; set; } = string.Empty;

    // Navigation properties
    public Group? Group { get; set; }
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
}
