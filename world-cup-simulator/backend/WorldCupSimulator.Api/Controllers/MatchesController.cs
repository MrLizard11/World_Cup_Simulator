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
}