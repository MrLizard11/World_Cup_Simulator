using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.DTOs;

namespace WorldCupSimulator.Api.Services;

public interface ITournamentService
{
    // Statistics
    Task<Result<TournamentStatisticsResponse>> GetTournamentStatisticsAsync();
    Task<Result<List<TeamPerformanceResponse>>> GetTeamPerformancesAsync();
    
    // Reset
    Task<Result> ResetTournamentAsync();
    
    // Bulk Operations
    Task<Result<List<TeamResponse>>> BulkCreateTeamsAsync(BulkCreateTeamsRequest request);
    Task<Result<List<GroupResponse>>> BulkCreateGroupsAsync(BulkCreateGroupsRequest request);
    Task<Result<List<TeamResponse>>> PopulateDefaultTeamsAsync(PopulateDefaultTeamsRequest request);
    
    // Knockout Management
    Task<Result<KnockoutBracketResponse>> GenerateKnockoutBracketAsync(GenerateKnockoutBracketRequest request);
    Task<Result<KnockoutBracketResponse>> GetKnockoutBracketAsync();
}