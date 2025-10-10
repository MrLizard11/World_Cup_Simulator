using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly ISimulationService _simulationService;

    public SimulationController(ISimulationService simulationService)
    {
        _simulationService = simulationService;
    }

    // POST: api/simulation/match
    [HttpPost("match")]
    public ActionResult<MatchSimulationResponse> SimulateMatch([FromBody] SimulateMatchRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = _simulationService.SimulateMatch(
            request.TeamA, 
            request.TeamB, 
            request.Mode, 
            request.SituationalFactors);

        var expectedScoreA = _simulationService.CalculateExpectedScore(request.TeamA.Elo, request.TeamB.Elo);
        var expectedScoreB = 1.0 - expectedScoreA;
        var strengthDifference = request.TeamA.Elo - request.TeamB.Elo;

        var response = new MatchSimulationResponse
        {
            ScoreA = result.scoreA,
            ScoreB = result.scoreB,
            TeamA = request.TeamA,
            TeamB = request.TeamB,
            Mode = request.Mode,
            SimulationDetails = new SimulationDetailsResponse
            {
                ExpectedScoreA = expectedScoreA,
                ExpectedScoreB = expectedScoreB,
                StrengthDifference = strengthDifference
            }
        };

        return Ok(response);
    }

    // POST: api/simulation/bulk-matches
    [HttpPost("bulk-matches")]
    public ActionResult<List<MatchSimulationResponse>> SimulateBulkMatches([FromBody] BulkSimulateMatchesRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var responses = new List<MatchSimulationResponse>();

        foreach (var matchRequest in request.Matches)
        {
            var result = _simulationService.SimulateMatch(
                matchRequest.TeamA,
                matchRequest.TeamB,
                request.Mode,
                matchRequest.SituationalFactors);

            var expectedScoreA = _simulationService.CalculateExpectedScore(matchRequest.TeamA.Elo, matchRequest.TeamB.Elo);
            var expectedScoreB = 1.0 - expectedScoreA;
            var strengthDifference = matchRequest.TeamA.Elo - matchRequest.TeamB.Elo;

            responses.Add(new MatchSimulationResponse
            {
                ScoreA = result.scoreA,
                ScoreB = result.scoreB,
                TeamA = matchRequest.TeamA,
                TeamB = matchRequest.TeamB,
                Mode = request.Mode,
                MatchId = matchRequest.MatchId,
                SimulationDetails = new SimulationDetailsResponse
                {
                    ExpectedScoreA = expectedScoreA,
                    ExpectedScoreB = expectedScoreB,
                    StrengthDifference = strengthDifference
                }
            });
        }

        return Ok(responses);
    }

    private string? GetSessionIdFromHeader()
    {
        return Request.Headers["X-Session-Id"].FirstOrDefault();
    }
}