using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;

namespace WorldCupSimulator.Api.Services;

public interface ITournamentService
{
    // Statistics
    Task<Result<TournamentStatisticsResponse>> GetTournamentStatisticsAsync(string sessionId);
    Task<Result<List<TeamPerformanceResponse>>> GetTeamPerformancesAsync(string sessionId);
    
    // Reset
    Task<Result> ResetTournamentAsync(string sessionId);
    
    // Bulk Operations
    Task<Result<List<TeamResponse>>> BulkCreateTeamsAsync(BulkCreateTeamsRequest request, string sessionId);
    Task<Result<List<GroupResponse>>> BulkCreateGroupsAsync(BulkCreateGroupsRequest request, string sessionId);
    Task<Result<List<TeamResponse>>> PopulateDefaultTeamsAsync(PopulateDefaultTeamsRequest request, string sessionId);
    
    // Knockout Management
    Task<Result<KnockoutBracketResponse>> GenerateKnockoutBracketAsync(GenerateKnockoutBracketRequest request, string sessionId);
    Task<Result<KnockoutBracketResponse>> GetKnockoutBracketAsync(string sessionId);
}