using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly WorldCupContext _context;

    public TeamsController(WorldCupContext context)
    {
        _context = context;
    }

    // GET: api/teams
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Team>>> GetTeams()
    {
        return await _context.Teams.ToListAsync();
    }

    // GET: api/teams/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Team>> GetTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team == null)
        {
            return NotFound();
        }

        return team;
    }

    // POST: api/teams
    [HttpPost]
    public async Task<ActionResult<Team>> CreateTeam(Team team)
    {
        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
    }

    // PUT: api/teams/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTeam(int id, Team team)
    {
        if (id != team.Id)
        {
            return BadRequest();
        }

        _context.Entry(team).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TeamExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/teams/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team == null)
        {
            return NotFound();
        }

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TeamExists(int id)
    {
        return _context.Teams.Any(e => e.Id == id);
    }
}
