namespace WorldCupSimulator.Api.DTOs;

public class KnockoutBracketResponse
{
    public List<KnockoutMatchResponse> RoundOf16 { get; set; } = new();
    public List<KnockoutMatchResponse> QuarterFinals { get; set; } = new();
    public List<KnockoutMatchResponse> SemiFinals { get; set; } = new();
    public KnockoutMatchResponse? ThirdPlaceMatch { get; set; }
    public KnockoutMatchResponse? Final { get; set; }
}