namespace WorldCupSimulator.Api.DTOs;

public class CreateKnockoutMatchRequest : CreateMatchRequest
{
    public string Round { get; set; } = string.Empty;
    public bool WentToPenalties { get; set; }
    public int? PenaltyScoreA { get; set; }
    public int? PenaltyScoreB { get; set; }
}
