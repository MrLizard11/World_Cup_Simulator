using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly WorldCupContext _context;

    public GroupsController(WorldCupContext context)
    {
        _context = context;
    }

    // GET: api/groups
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
    {
        return await _context.Groups
            .Include(g => g.Teams)
            .Include(g => g.Matches)
            .ToListAsync();
    }

    // GET: api/groups/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Group>> GetGroup(int id)
    {
        var group = await _context.Groups
            .Include(g => g.Teams)
            .Include(g => g.Matches)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (group == null)
        {
            return NotFound();
        }

        return group;
    }

    // POST: api/groups
    [HttpPost]
    public async Task<ActionResult<Group>> CreateGroup(Group group)
    {
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
    }

    // POST: api/groups/{groupId}/teams
    [HttpPost("{groupId}/teams")]
    public async Task<ActionResult<List<GroupTeamResponse>>> AddTeamsToGroup(int groupId, [FromBody] AddTeamsToGroupRequest request)
    {
        var group = await _context.Groups.FindAsync(groupId);
        if (group == null)
        {
            return NotFound($"Group with ID {groupId} not found");
        }

        var teams = await _context.Teams
            .Where(t => request.TeamIds.Contains(t.Id))
            .ToListAsync();

        if (teams.Count != request.TeamIds.Count)
        {
            var foundIds = teams.Select(t => t.Id);
            var missingIds = request.TeamIds.Where(id => !foundIds.Contains(id));
            return BadRequest($"Teams not found: {string.Join(", ", missingIds)}");
        }

        // Check if any teams are already in the group
        var existingTeams = await _context.GroupTeams
            .Where(gt => gt.GroupId == groupId && request.TeamIds.Contains(gt.TeamId))
            .Select(gt => gt.TeamId)
            .ToListAsync();

        if (existingTeams.Any())
        {
            return BadRequest($"Teams with IDs {string.Join(", ", existingTeams)} are already in this group");
        }

        var groupTeams = request.TeamIds.Select(teamId => new GroupTeam
        {
            GroupId = groupId,
            TeamId = teamId,
            Points = 0,
            MatchesPlayed = 0,
            Wins = 0,
            Draws = 0,
            Losses = 0,
            GoalsFor = 0,
            GoalsAgainst = 0,
            GoalDifference = 0
        }).ToList();

        _context.GroupTeams.AddRange(groupTeams);
        await _context.SaveChangesAsync();

        // Reload with team details and map to response DTO
        var groupTeamResponses = await _context.GroupTeams
            .Include(gt => gt.Team)
            .Where(gt => gt.GroupId == groupId && request.TeamIds.Contains(gt.TeamId))
            .Select(gt => new GroupTeamResponse
            {
                GroupId = gt.GroupId,
                TeamId = gt.TeamId,
                TeamName = gt.Team.Name,
                TeamCountry = gt.Team.Country,
                TeamCountryCode = gt.Team.CountryCode,
                TeamElo = gt.Team.Elo,
                Points = gt.Points,
                MatchesPlayed = gt.MatchesPlayed,
                Wins = gt.Wins,
                Draws = gt.Draws,
                Losses = gt.Losses,
                GoalsFor = gt.GoalsFor,
                GoalsAgainst = gt.GoalsAgainst,
                GoalDifference = gt.GoalDifference
            })
            .ToListAsync();

        return CreatedAtAction(nameof(GetGroup), new { id = groupId }, groupTeamResponses);
    }

    // PUT: api/groups/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(int id, Group group)
    {
        if (id != group.Id)
        {
            return BadRequest();
        }

        _context.Entry(group).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!GroupExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/groups/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group == null)
        {
            return NotFound();
        }

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool GroupExists(int id)
    {
        return _context.Groups.Any(e => e.Id == id);
    }
}
