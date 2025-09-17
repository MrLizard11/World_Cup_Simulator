using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly IMatchService _matchService;
    private readonly ILogger<MatchesController> _logger;

    public MatchesController(IMatchService matchService, ILogger<MatchesController> logger)
    {
        _matchService = matchService;
        _logger = logger;
    }

    // GET: api/matches
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Match>>> GetMatches()
    {
        var result = await _matchService.GetMatchesAsync();
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // GET: api/matches/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Match>> GetMatch(int id)
    {
        var result = await _matchService.GetMatchByIdAsync(id);
        return result.Match<ActionResult<Match>, Match>(
            onSuccess: match => Ok(match),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // GET: api/matches/knockout
    [HttpGet("knockout")]
    public async Task<ActionResult<IEnumerable<KnockoutMatch>>> GetKnockoutMatches()
    {
        var result = await _matchService.GetKnockoutMatchesAsync();
        return result.Match<ActionResult<IEnumerable<KnockoutMatch>>, IEnumerable<KnockoutMatch>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // GET: api/matches/group/5
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<Match>>> GetMatchesByGroup(int groupId)
    {
        var result = await _matchService.GetMatchesByGroupAsync(groupId);
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // POST: api/matches
    [HttpPost]
    public async Task<ActionResult<Match>> CreateMatch(CreateMatchRequest request)
    {
        var result = await _matchService.CreateMatchAsync(request);
        return result.Match<ActionResult<Match>, Match>(
            onSuccess: match => CreatedAtAction(nameof(GetMatch), new { id = match.Id }, match),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/matches/knockout
    [HttpPost("knockout")]
    public async Task<ActionResult<KnockoutMatch>> CreateKnockoutMatch(CreateKnockoutMatchRequest request)
    {
        var result = await _matchService.CreateKnockoutMatchAsync(request);
        return result.Match<ActionResult<KnockoutMatch>, KnockoutMatch>(
            onSuccess: match => CreatedAtAction(nameof(GetMatch), new { id = match.Id }, match),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // DELETE: api/matches/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        var result = await _matchService.DeleteMatchAsync(id);
        return result.Match<IActionResult>(
            onSuccess: () => NoContent(),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/matches/5/simulate
    [HttpPost("{id}/simulate")]
    public async Task<ActionResult<Match>> SimulateMatch(int id, [FromQuery] SimulationMode mode = SimulationMode.EloRealistic)
    {
        var result = await _matchService.SimulateMatchAsync(id, mode);
        return result.Match<ActionResult<Match>, Match>(
            onSuccess: match => Ok(match),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/matches/simulate-group/5
    [HttpPost("simulate-group/{groupId}")]
    public async Task<ActionResult<IEnumerable<Match>>> SimulateGroupMatches(int groupId, [FromQuery] SimulationMode mode = SimulationMode.EloRealistic)
    {
        var result = await _matchService.SimulateAllGroupMatchesAsync(groupId, mode);
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // POST: api/matches/simulate/group 
    [HttpPost("simulate/group")]
    public async Task<ActionResult<IEnumerable<Match>>> SimulateGroupMatchesAlt([FromBody] SimulateGroupMatchesRequest request)
    {
        var mode = Enum.Parse<SimulationMode>(request.SimulationMode, true);
        var result = await _matchService.SimulateAllGroupMatchesAsync(request.GroupId, mode);
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // POST: api/matches/simulate-all-groups
    [HttpPost("simulate-all-groups")]
    public async Task<ActionResult<IEnumerable<Match>>> SimulateAllGroups([FromQuery] SimulationMode mode = SimulationMode.EloRealistic)
    {
        var result = await _matchService.SimulateAllGroupStageAsync(mode);
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }

    // POST: api/matches/knockout/5/simulate
    [HttpPost("knockout/{id}/simulate")]
    public async Task<ActionResult<KnockoutMatch>> SimulateKnockoutMatch(int id, [FromQuery] SimulationMode mode = SimulationMode.EloRealistic)
    {
        var result = await _matchService.SimulateKnockoutMatchAsync(id, mode);
        return result.Match<ActionResult<KnockoutMatch>, KnockoutMatch>(
            onSuccess: match => Ok(match),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/matches/generate/group
    [HttpPost("generate/group")]
    public async Task<ActionResult<IEnumerable<Match>>> GenerateGroupMatches([FromBody] GenerateGroupMatchesRequest request)
    {
        var result = await _matchService.GenerateGroupMatchesAsync(request.GroupId);
        return result.Match<ActionResult<IEnumerable<Match>>, IEnumerable<Match>>(
            onSuccess: matches => Ok(matches),
            onFailure: error => BadRequest(error));
    }
}