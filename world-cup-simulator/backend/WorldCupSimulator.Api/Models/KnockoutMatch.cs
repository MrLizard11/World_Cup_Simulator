namespace WorldCupSimulator.Api.Models;

public enum KnockoutRound
{
    RoundOf16,
    QuarterFinals,
    SemiFinals,
    ThirdPlace,
    Final
}

public class KnockoutMatch : Match
{
    public string? Winner { get; set; }
    public int? PenaltyScoreA { get; set; }
    public int? PenaltyScoreB { get; set; }
    public bool WentToPenalties { get; set; }
    public KnockoutRound Round { get; set; }

    // Navigation properties for different knockout stages
    public KnockoutStage? RoundOf16Stage { get; set; }
    public KnockoutStage? QuarterFinalsStage { get; set; }
    public KnockoutStage? SemiFinalsStage { get; set; }
    public KnockoutStage? ThirdPlaceStage { get; set; }
    public KnockoutStage? FinalStage { get; set; }
}
