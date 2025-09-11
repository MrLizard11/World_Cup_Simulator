using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;
    private readonly ILogger<TeamsController> _logger;

    public TeamsController(ITeamService teamService, ILogger<TeamsController> logger)
    {
        _teamService = teamService;
        _logger = logger;
    }

    // GET: api/teams
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamResponse>>> GetTeams()
    {
        var result = await _teamService.GetTeamsAsync();
        return result.Match<ActionResult<IEnumerable<TeamResponse>>, IEnumerable<TeamResponse>>(
            onSuccess: teams => Ok(teams),
            onFailure: error => BadRequest(error));
    }

    // GET: api/teams/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TeamResponse>> GetTeam(int id)
    {
        var result = await _teamService.GetTeamByIdAsync(id);
        return result.Match<ActionResult<TeamResponse>, TeamResponse>(
            onSuccess: team => Ok(team),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/teams
    [HttpPost]
    public async Task<ActionResult<TeamResponse>> CreateTeam(CreateTeamRequest request)
    {
        _logger.LogInformation("Creating new team: {TeamName}", request.Name);
        var result = await _teamService.CreateTeamAsync(request);
        return result.Match<ActionResult<TeamResponse>, TeamResponse>(
            onSuccess: team => CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team),
            onFailure: error => BadRequest(error));
    }

    // PUT: api/teams/5
    [HttpPut("{id}")]
    public async Task<ActionResult<TeamResponse>> UpdateTeam(int id, UpdateTeamRequest request)
    {
        _logger.LogInformation("Updating team {TeamId}", id);
        var result = await _teamService.UpdateTeamAsync(id, request);
        return result.Match<ActionResult<TeamResponse>, TeamResponse>(
            onSuccess: team => Ok(team),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // DELETE: api/teams/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        _logger.LogInformation("Deleting team {TeamId}", id);
        var result = await _teamService.DeleteTeamAsync(id);
        return result.Match<IActionResult>(
            onSuccess: () => NoContent(),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }
}
