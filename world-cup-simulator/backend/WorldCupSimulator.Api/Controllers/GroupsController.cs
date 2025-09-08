using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;
using WorldCupSimulator.Api.Services;

namespace WorldCupSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    // GET: api/groups
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GroupResponse>>> GetGroups()
    {
        var groups = await _groupService.GetGroupsAsync();
        return Ok(groups);
    }

    // GET: api/groups/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GroupResponse>> GetGroup(int id)
    {
        var group = await _groupService.GetGroupByIdAsync(id);
        if (group == null)
        {
            return NotFound();
        }

        return Ok(group);
    }

    // POST: api/groups
    [HttpPost]
    public async Task<ActionResult<GroupResponse>> CreateGroup(Group group)
    {
        var createdGroup = await _groupService.CreateGroupAsync(group);
        return CreatedAtAction(nameof(GetGroup), new { id = createdGroup.Id }, createdGroup);
    }

    // POST: api/groups/{groupId}/teams
    [HttpPost("{groupId}/teams")]
    public async Task<ActionResult<List<GroupTeamResponse>>> AddTeamsToGroup(int groupId, [FromBody] AddTeamsToGroupRequest request)
    {
        try
        {
            var response = await _groupService.AddTeamsToGroupAsync(groupId, request);
            return CreatedAtAction(nameof(GetGroup), new { id = groupId }, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/groups/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(int id, Group group)
    {
        try
        {
            await _groupService.UpdateGroupAsync(id, group);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    // DELETE: api/groups/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        try
        {
            await _groupService.DeleteGroupAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}