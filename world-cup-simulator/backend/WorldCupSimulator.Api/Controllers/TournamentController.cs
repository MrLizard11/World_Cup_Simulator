using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TournamentController : ControllerBase
{
    private readonly ITournamentService _tournamentService;

    public TournamentController(ITournamentService tournamentService)
    {
        _tournamentService = tournamentService;
    }

    // GET: api/tournament/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<TournamentStatisticsResponse>> GetTournamentStatistics()
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.GetTournamentStatisticsAsync(sessionId);
        return result.Match<ActionResult<TournamentStatisticsResponse>, TournamentStatisticsResponse>(
            onSuccess: stats => Ok(stats),
            onFailure: error => BadRequest(error));
    }

    // GET: api/tournament/team-performances
    [HttpGet("team-performances")]
    public async Task<ActionResult<List<TeamPerformanceResponse>>> GetTeamPerformances()
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.GetTeamPerformancesAsync(sessionId);
        return result.Match<ActionResult<List<TeamPerformanceResponse>>, List<TeamPerformanceResponse>>(
            onSuccess: performances => Ok(performances),
            onFailure: error => BadRequest(error));
    }

    // POST: api/tournament/reset
    [HttpPost("reset")]
    public async Task<IActionResult> ResetTournament()
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.ResetTournamentAsync(sessionId);
        return result.Match<IActionResult>(
            onSuccess: () => Ok(new { message = "Tournament reset successfully" }),
            onFailure: error => BadRequest(error));
    }

    // POST: api/tournament/bulk/teams
    [HttpPost("bulk/teams")]
    public async Task<ActionResult<List<TeamResponse>>> BulkCreateTeams([FromBody] BulkCreateTeamsRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.BulkCreateTeamsAsync(request, sessionId);
        return result.Match<ActionResult<List<TeamResponse>>, List<TeamResponse>>(
            onSuccess: teams => Ok(teams),
            onFailure: error => BadRequest(error));
    }

    // POST: api/tournament/bulk/groups
    [HttpPost("bulk/groups")]
    public async Task<ActionResult<List<GroupResponse>>> BulkCreateGroups([FromBody] BulkCreateGroupsRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.BulkCreateGroupsAsync(request, sessionId);
        return result.Match<ActionResult<List<GroupResponse>>, List<GroupResponse>>(
            onSuccess: groups => Ok(groups),
            onFailure: error => BadRequest(error));
    }

    // POST: api/tournament/populate-default-teams
    [HttpPost("populate-default-teams")]
    public async Task<ActionResult<List<TeamResponse>>> PopulateDefaultTeams([FromBody] PopulateDefaultTeamsRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.PopulateDefaultTeamsAsync(request, sessionId);
        return result.Match<ActionResult<List<TeamResponse>>, List<TeamResponse>>(
            onSuccess: teams => Ok(teams),
            onFailure: error => BadRequest(error));
    }

    // POST: api/tournament/knockout/generate-bracket
    [HttpPost("knockout/generate-bracket")]
    public async Task<ActionResult<KnockoutBracketResponse>> GenerateKnockoutBracket([FromBody] GenerateKnockoutBracketRequest request)
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.GenerateKnockoutBracketAsync(request, sessionId);
        return result.Match<ActionResult<KnockoutBracketResponse>, KnockoutBracketResponse>(
            onSuccess: bracket => Ok(bracket),
            onFailure: error => BadRequest(error));
    }

    // GET: api/tournament/knockout/bracket
    [HttpGet("knockout/bracket")]
    public async Task<ActionResult<KnockoutBracketResponse>> GetKnockoutBracket()
    {
        var sessionId = GetSessionIdFromHeader();
        if (sessionId == null)
            return BadRequest("Session ID is required in X-Session-Id header");

        var result = await _tournamentService.GetKnockoutBracketAsync(sessionId);
        return result.Match<ActionResult<KnockoutBracketResponse>, KnockoutBracketResponse>(
            onSuccess: bracket => Ok(bracket),
            onFailure: error => BadRequest(error));
    }

    private string? GetSessionIdFromHeader()
    {
        return Request.Headers["X-Session-Id"].FirstOrDefault();
    }
}