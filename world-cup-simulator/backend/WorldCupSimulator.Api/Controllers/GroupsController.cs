using Microsoft.AspNetCore.Mvc;
using WorldCupSimulator.Api.Common;
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
        var result = await _groupService.GetGroupsAsync();
        return result.Match<ActionResult<IEnumerable<GroupResponse>>, IEnumerable<GroupResponse>>(
            onSuccess: groups => Ok(groups),
            onFailure: error => BadRequest(error));
    }

    // GET: api/groups/5
    [HttpGet("{id}")]
    public async Task<ActionResult<GroupResponse>> GetGroup(int id)
    {
        var result = await _groupService.GetGroupByIdAsync(id);
        return result.Match<ActionResult<GroupResponse>, GroupResponse>(
            onSuccess: group => Ok(group),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // POST: api/groups
    [HttpPost]
    public async Task<ActionResult<GroupResponse>> CreateGroup(Group group)
    {
        var result = await _groupService.CreateGroupAsync(group);
        return result.Match<ActionResult<GroupResponse>, GroupResponse>(
            onSuccess: createdGroup => CreatedAtAction(nameof(GetGroup), new { id = createdGroup.Id }, createdGroup),
            onFailure: error => BadRequest(error));
    }

    // POST: api/groups/{groupId}/teams
    [HttpPost("{groupId}/teams")]
    public async Task<ActionResult<List<GroupTeamResponse>>> AddTeamsToGroup(int groupId, [FromBody] AddTeamsToGroupRequest request)
    {
        var result = await _groupService.AddTeamsToGroupAsync(groupId, request);
        return result.Match<ActionResult<List<GroupTeamResponse>>, List<GroupTeamResponse>>(
            onSuccess: response => CreatedAtAction(nameof(GetGroup), new { id = groupId }, response),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // PUT: api/groups/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGroup(int id, Group group)
    {
        var result = await _groupService.UpdateGroupAsync(id, group);
        return result.Match<IActionResult>(
            onSuccess: () => NoContent(),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }

    // DELETE: api/groups/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGroup(int id)
    {
        var result = await _groupService.DeleteGroupAsync(id);
        return result.Match<IActionResult>(
            onSuccess: () => NoContent(),
            onFailure: error => error.Code.Contains("NotFound") 
                ? NotFound(error.Description) 
                : BadRequest(error));
    }
}