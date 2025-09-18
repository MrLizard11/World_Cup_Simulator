namespace WorldCupSimulator.Api.DTOs;

public class KnockoutMatchResponse
{
    public int Id { get; set; }
    public TeamResponse? TeamA { get; set; }
    public TeamResponse? TeamB { get; set; }
    public int ScoreA { get; set; }
    public int ScoreB { get; set; }
    public int? PenaltyScoreA { get; set; }
    public int? PenaltyScoreB { get; set; }
    public bool WentToPenalties { get; set; }
    public bool Played { get; set; }
    public string Round { get; set; } = string.Empty;
    public string Winner { get; set; } = string.Empty;
}