namespace WorldCupSimulator.Api.DTOs;

public class CreateMatchRequest
{
    public int TeamAId { get; set; }
    public int TeamBId { get; set; }
    public int? GroupId { get; set; }
    public int ScoreA { get; set; }
    public int ScoreB { get; set; }
    public bool Played { get; set; }
}
