namespace WorldCupSimulator.Api.DTOs;

public class SimulateGroupMatchesRequest
{
    public int GroupId { get; set; }
    public string SimulationMode { get; set; } = "EloRealistic";
}