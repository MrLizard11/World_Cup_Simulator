using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public interface ITeamService
    {
        Task<Result<IEnumerable<TeamResponse>>> GetTeamsAsync();
        Task<Result<TeamResponse>> GetTeamByIdAsync(int id);
        Task<Result<TeamResponse>> CreateTeamAsync(CreateTeamRequest request);
        Task<Result<TeamResponse>> UpdateTeamAsync(int id, UpdateTeamRequest request);
        Task<Result> DeleteTeamAsync(int id);
    }
}
