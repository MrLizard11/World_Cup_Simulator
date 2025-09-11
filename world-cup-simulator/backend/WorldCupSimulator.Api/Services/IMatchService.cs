using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public interface IMatchService
    {
        Task<Result<IEnumerable<Match>>> GetMatchesAsync();
        Task<Result<Match>> GetMatchByIdAsync(int id);
        Task<Result<IEnumerable<KnockoutMatch>>> GetKnockoutMatchesAsync();
        Task<Result<IEnumerable<Match>>> GetMatchesByGroupAsync(int groupId);
        Task<Result<Match>> CreateMatchAsync(CreateMatchRequest request);
        Task<Result<KnockoutMatch>> CreateKnockoutMatchAsync(CreateKnockoutMatchRequest request);
        Task<Result> DeleteMatchAsync(int id);
    }
}