using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public interface ITeamService
    {
        Task<IEnumerable<TeamResponse>> GetTeamsAsync();
        Task<TeamResponse?> GetTeamByIdAsync(int id);
        Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request);
        Task<TeamResponse> UpdateTeamAsync(int id, UpdateTeamRequest request);
        Task DeleteTeamAsync(int id);
    }
}
