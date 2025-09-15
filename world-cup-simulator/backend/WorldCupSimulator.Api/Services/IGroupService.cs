using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public interface IGroupService
    {
        Task<Result<IEnumerable<GroupResponse>>> GetGroupsAsync();
        Task<Result<GroupResponse>> GetGroupByIdAsync(int id);
        Task<Result<GroupResponse>> CreateGroupAsync(Group group);
        Task<Result<List<GroupTeamResponse>>> AddTeamsToGroupAsync(int groupId, AddTeamsToGroupRequest request);
        Task<Result> UpdateGroupAsync(int id, Group group);
        Task<Result> DeleteGroupAsync(int id);
    }
}
