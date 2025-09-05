using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly WorldCupContext _context;

    public MatchesController(WorldCupContext context)
    {
        _context = context;
    }

    // GET: api/matches
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Match>>> GetMatches()
    {
        if (!_context.Matches.Any())
        {
            return new List<Match>();
        }

        var matches = await _context.Matches
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Group)
            .ToListAsync();

        return matches;
    }

    // GET: api/matches/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Match>> GetMatch(int id)
    {
        var match = await _context.Matches
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Group)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (match == null)
        {
            return NotFound();
        }

        return match;
    }

    // GET: api/matches/knockout
    [HttpGet("knockout")]
    public async Task<ActionResult<IEnumerable<KnockoutMatch>>> GetKnockoutMatches()
    {
        var matches = await _context.Matches
            .OfType<KnockoutMatch>()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .ToListAsync();

        return matches;
    }

    // GET: api/matches/group/5
    [HttpGet("group/{groupId}")]
    public async Task<ActionResult<IEnumerable<Match>>> GetMatchesByGroup(int groupId)
    {
        if (! _context.Matches.Any(m => m.GroupId == groupId))
        {
            return new List<Match>();
        }

        return await _context.Matches
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Where(m => m.GroupId == groupId)
            .ToListAsync();
    }

    // POST: api/matches
    [HttpPost]
    public async Task<ActionResult<Match>> CreateMatch(CreateMatchRequest request)
    {
        try
        {
            var teamA = await _context.Teams.FindAsync(request.TeamAId);
            var teamB = await _context.Teams.FindAsync(request.TeamBId);
            
            if (teamA == null)
            {
                return BadRequest($"Team A with ID {request.TeamAId} not found");
            }
            
            if (teamB == null)
            {
                return BadRequest($"Team B with ID {request.TeamBId} not found");
            }

            if (request.GroupId.HasValue)
            {
                var group = await _context.Groups.FindAsync(request.GroupId.Value);
                if (group == null)
                {
                    return BadRequest($"Group with ID {request.GroupId.Value} not found");
                }

                // Verify both teams are in the group
                var groupTeams = await _context.GroupTeams
                    .Where(gt => gt.GroupId == request.GroupId.Value)
                    .Select(gt => gt.TeamId)
                    .ToListAsync();

                if (!groupTeams.Contains(request.TeamAId))
                {
                    return BadRequest($"Team A (ID: {request.TeamAId}) is not in the group");
                }

                if (!groupTeams.Contains(request.TeamBId))
                {
                    return BadRequest($"Team B (ID: {request.TeamBId}) is not in the group");
                }
            }

            var match = new GroupMatch
            {
                TeamAId = request.TeamAId,
                TeamBId = request.TeamBId,
                GroupId = request.GroupId,
                ScoreA = request.ScoreA,
                ScoreB = request.ScoreB,
                Played = request.Played
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            await _context.Entry(match).ReloadAsync();

            // Explicitly load related entities
            await _context.Entry(match).Reference(m => m.TeamA).LoadAsync();
            await _context.Entry(match).Reference(m => m.TeamB).LoadAsync();
            await _context.Entry(match).Reference(m => m.Group).LoadAsync();

            return CreatedAtAction(nameof(GetMatch), new { id = match.Id }, match);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Failed to create match: {ex.Message}");
        }
    }

    // POST: api/matches/knockout
    [HttpPost("knockout")]
    public async Task<ActionResult<Match>> CreateKnockoutMatch(CreateKnockoutMatchRequest request)
    {
        var teamA = await _context.Teams.FindAsync(request.TeamAId);
        var teamB = await _context.Teams.FindAsync(request.TeamBId);
        
        if (teamA == null || teamB == null)
        {
            return BadRequest("Invalid team IDs");
        }

        var match = new KnockoutMatch
        {
            TeamAId = request.TeamAId,
            TeamBId = request.TeamBId,
            ScoreA = request.ScoreA,
            ScoreB = request.ScoreB,
            Played = request.Played,
            Round = Enum.Parse<KnockoutRound>(request.Round),
            WentToPenalties = request.WentToPenalties,
            PenaltyScoreA = request.PenaltyScoreA,
            PenaltyScoreB = request.PenaltyScoreB
        };

        _context.Matches.Add(match);
        await _context.SaveChangesAsync();

        // Reload the match with navigation properties
        var createdMatch = await _context.Matches
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .FirstOrDefaultAsync(m => m.Id == match.Id);

        return CreatedAtAction(nameof(GetMatch), new { id = match.Id }, createdMatch);
    }

    // PUT: api/matches/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMatch(int id, Match match)
    {
        if (id != match.Id)
        {
            return BadRequest();
        }

        _context.Entry(match).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();

            // If match is completed, update group standings
            if (match.Played && match.GroupId.HasValue)
            {
                await UpdateGroupStandings(match);
            }
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MatchExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/matches/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        var match = await _context.Matches.FindAsync(id);
        if (match == null)
        {
            return NotFound();
        }

        _context.Matches.Remove(match);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MatchExists(int id)
    {
        return _context.Matches.Any(e => e.Id == id);
    }

    private async Task UpdateGroupStandings(Match match)
    {
        var teamAStanding = await _context.GroupTeams
            .FirstOrDefaultAsync(gt => gt.GroupId == match.GroupId && gt.TeamId == match.TeamAId);
        var teamBStanding = await _context.GroupTeams
            .FirstOrDefaultAsync(gt => gt.GroupId == match.GroupId && gt.TeamId == match.TeamBId);

        if (teamAStanding != null && teamBStanding != null)
        {
            // Update matches played
            teamAStanding.MatchesPlayed++;
            teamBStanding.MatchesPlayed++;

            // Update goals
            teamAStanding.GoalsFor += match.ScoreA;
            teamAStanding.GoalsAgainst += match.ScoreB;
            teamBStanding.GoalsFor += match.ScoreB;
            teamBStanding.GoalsAgainst += match.ScoreA;

            // Update goal difference
            teamAStanding.GoalDifference = teamAStanding.GoalsFor - teamAStanding.GoalsAgainst;
            teamBStanding.GoalDifference = teamBStanding.GoalsFor - teamBStanding.GoalsAgainst;

            // Update points and win/draw/loss records
            if (match.ScoreA > match.ScoreB)
            {
                teamAStanding.Points += 3;
                teamAStanding.Wins++;
                teamBStanding.Losses++;
            }
            else if (match.ScoreA < match.ScoreB)
            {
                teamBStanding.Points += 3;
                teamBStanding.Wins++;
                teamAStanding.Losses++;
            }
            else
            {
                teamAStanding.Points++;
                teamBStanding.Points++;
                teamAStanding.Draws++;
                teamBStanding.Draws++;
            }

            await _context.SaveChangesAsync();
        }
    }
}
