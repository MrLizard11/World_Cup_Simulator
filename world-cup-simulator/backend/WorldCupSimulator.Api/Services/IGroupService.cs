using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public interface IGroupService
    {
        Task<IEnumerable<GroupResponse>> GetGroupsAsync();
        Task<GroupResponse?> GetGroupByIdAsync(int id);
        Task<GroupResponse> CreateGroupAsync(Group group);
        Task<List<GroupTeamResponse>> AddTeamsToGroupAsync(int groupId, AddTeamsToGroupRequest request);
        Task UpdateGroupAsync(int id, Group group);
        Task DeleteGroupAsync(int id);
    }
}
