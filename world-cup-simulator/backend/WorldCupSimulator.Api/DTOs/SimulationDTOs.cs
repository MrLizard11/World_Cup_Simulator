using WorldCupSimulator.Api.Models;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.DTOs;

public class SimulateMatchRequest
{
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
    public SimulationMode Mode { get; set; } = SimulationMode.EloRealistic;
    public SituationalFactors? SituationalFactors { get; set; }
}

public class SingleMatchRequest
{
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
    public SituationalFactors? SituationalFactors { get; set; }
    public int? MatchId { get; set; } // Optional for tracking
}

public class BulkSimulateMatchesRequest
{
    public List<SingleMatchRequest> Matches { get; set; } = new();
    public SimulationMode Mode { get; set; } = SimulationMode.EloRealistic;
}

public class MatchSimulationResponse
{
    public int ScoreA { get; set; }
    public int ScoreB { get; set; }
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
    public SimulationMode Mode { get; set; }
    public int? MatchId { get; set; }
    public SimulationDetailsResponse SimulationDetails { get; set; } = null!;
}

public class SimulationDetailsResponse
{
    public double ExpectedScoreA { get; set; }
    public double ExpectedScoreB { get; set; }
    public double StrengthDifference { get; set; }
}