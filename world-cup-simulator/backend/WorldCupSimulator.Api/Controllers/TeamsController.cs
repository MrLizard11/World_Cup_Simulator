using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
        var teams = await _teamService.GetTeamsAsync();
        return Ok(teams);
    }

    // GET: api/teams/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TeamResponse>> GetTeam(int id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        
        if (team == null)
        {
            _logger.LogWarning("Team with ID {TeamId} not found", id);
            return NotFound();
        }

        return Ok(team);
    }

    // POST: api/teams
    [HttpPost]
    public async Task<ActionResult<TeamResponse>> CreateTeam(CreateTeamRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new team: {TeamName}", request.Name);
            var team = await _teamService.CreateTeamAsync(request);
            return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating team: {TeamName}", request.Name);
            return StatusCode(500, "An error occurred while creating the team");
        }
    }

    // PUT: api/teams/5
    [HttpPut("{id}")]
    public async Task<ActionResult<TeamResponse>> UpdateTeam(int id, UpdateTeamRequest request)
    {
        try
        {
            _logger.LogInformation("Updating team {TeamId}", id);
            var team = await _teamService.UpdateTeamAsync(id, request);
            return Ok(team);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Team {TeamId} not found for update", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team {TeamId}", id);
            return StatusCode(500, "An error occurred while updating the team");
        }
    }

    // DELETE: api/teams/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        try
        {
            _logger.LogInformation("Deleting team {TeamId}", id);
            await _teamService.DeleteTeamAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Team {TeamId} not found for deletion", id);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting team {TeamId}", id);
            return StatusCode(500, "An error occurred while deleting the team");
        }
    }
}
