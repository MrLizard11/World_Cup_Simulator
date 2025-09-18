using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services;

public class TournamentService : ITournamentService
{
    private readonly WorldCupContext _context;

    public TournamentService(WorldCupContext context)
    {
        _context = context;
    }

    public async Task<Result<TournamentStatisticsResponse>> GetTournamentStatisticsAsync()
    {
        var allMatches = await _context.Matches
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Where(m => m.Played)
            .ToListAsync();

        var totalGoals = allMatches.Sum(m => m.ScoreA + m.ScoreB);
        var totalMatches = allMatches.Count;
        var averageGoals = totalMatches > 0 ? (double)totalGoals / totalMatches : 0;

        // Find biggest win
        var biggestWin = allMatches
            .Where(m => Math.Abs(m.ScoreA - m.ScoreB) > 0)
            .OrderByDescending(m => Math.Abs(m.ScoreA - m.ScoreB))
            .FirstOrDefault();

        var biggestWinResponse = new BiggestWinResponse();
        if (biggestWin != null)
        {
            biggestWinResponse.Match = $"{biggestWin.TeamA.Name} vs {biggestWin.TeamB.Name}";
            biggestWinResponse.Score = $"{biggestWin.ScoreA}-{biggestWin.ScoreB}";
            biggestWinResponse.Difference = Math.Abs(biggestWin.ScoreA - biggestWin.ScoreB);
        }

        // Find most goals in a match
        var mostGoalsMatch = allMatches
            .OrderByDescending(m => m.ScoreA + m.ScoreB)
            .FirstOrDefault();

        var mostGoalsResponse = new MostGoalsMatchResponse();
        if (mostGoalsMatch != null)
        {
            mostGoalsResponse.Match = $"{mostGoalsMatch.TeamA.Name} vs {mostGoalsMatch.TeamB.Name}";
            mostGoalsResponse.Goals = mostGoalsMatch.ScoreA + mostGoalsMatch.ScoreB;
        }

        // Count penalty shootouts
        var penaltyShootouts = await _context.Matches
            .OfType<KnockoutMatch>()
            .Where(m => m.WentToPenalties)
            .CountAsync();

        var allMatchesCount = await _context.Matches.CountAsync();

        var statistics = new TournamentStatisticsResponse
        {
            TotalGoals = totalGoals,
            AverageGoalsPerMatch = Math.Round(averageGoals, 2),
            BiggestWin = biggestWinResponse,
            PenaltyShootouts = penaltyShootouts,
            MostGoalsInMatch = mostGoalsResponse,
            TotalMatches = allMatchesCount,
            CompletedMatches = totalMatches
        };

        return Result.Success(statistics);
    }

    public async Task<Result<List<TeamPerformanceResponse>>> GetTeamPerformancesAsync()
    {
        var teams = await _context.Teams.ToListAsync();
        var performances = new List<TeamPerformanceResponse>();

        foreach (var team in teams)
        {
            var teamMatches = await _context.Matches
                .Where(m => m.Played && (m.TeamAId == team.Id || m.TeamBId == team.Id))
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .ToListAsync();

            var goalsScored = teamMatches.Sum(m => m.TeamAId == team.Id ? m.ScoreA : m.ScoreB);
            var goalsConceded = teamMatches.Sum(m => m.TeamAId == team.Id ? m.ScoreB : m.ScoreA);

            performances.Add(new TeamPerformanceResponse
            {
                Team = MapToTeamResponse(team),
                MatchesPlayed = teamMatches.Count,
                GoalsScored = goalsScored,
                GoalsConceded = goalsConceded,
                GoalDifference = goalsScored - goalsConceded,
                FinalPosition = "TBD", // Would need knockout results to determine
                Path = new List<string>() // Would track progression through tournament
            });
        }

        return Result.Success(performances);
    }

    public async Task<Result> ResetTournamentAsync()
    {
        // Delete all matches
        var matches = await _context.Matches.ToListAsync();
        _context.Matches.RemoveRange(matches);

        // Delete all group teams
        var groupTeams = await _context.GroupTeams.ToListAsync();
        _context.GroupTeams.RemoveRange(groupTeams);

        // Delete all groups
        var groups = await _context.Groups.ToListAsync();
        _context.Groups.RemoveRange(groups);

        // Delete all teams
        var teams = await _context.Teams.ToListAsync();
        _context.Teams.RemoveRange(teams);

        await _context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<List<TeamResponse>>> BulkCreateTeamsAsync(BulkCreateTeamsRequest request)
    {
        var teams = new List<Team>();
        var responses = new List<TeamResponse>();

        foreach (var teamRequest in request.Teams)
        {
            var team = new Team
            {
                Name = teamRequest.Name,
                Country = teamRequest.Country,
                Elo = teamRequest.Elo,
                CountryCode = teamRequest.CountryCode
            };
            teams.Add(team);
        }

        _context.Teams.AddRange(teams);
        await _context.SaveChangesAsync();

        foreach (var team in teams)
        {
            responses.Add(MapToTeamResponse(team));
        }

        return Result.Success(responses);
    }

    public async Task<Result<List<GroupResponse>>> BulkCreateGroupsAsync(BulkCreateGroupsRequest request)
    {
        var groups = new List<Group>();
        var responses = new List<GroupResponse>();

        foreach (var groupName in request.GroupNames)
        {
            var group = new Group { Name = groupName };
            groups.Add(group);
        }

        _context.Groups.AddRange(groups);
        await _context.SaveChangesAsync();

        foreach (var group in groups)
        {
            responses.Add(new GroupResponse
            {
                Id = group.Id,
                Name = group.Name,
                Teams = new List<GroupTeamResponse>()
            });
        }

        return Result.Success(responses);
    }

    public async Task<Result<List<TeamResponse>>> PopulateDefaultTeamsAsync(PopulateDefaultTeamsRequest request)
    {
        var defaultTeams = new List<CreateTeamRequest>
        {
            // Based on recent FIFA rankings and international performance (synced with frontend)
            new() { Name = "Spain", Country = "Spain", CountryCode = "ES", Elo = 2156 },
            new() { Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 2131 },
            new() { Name = "France", Country = "France", CountryCode = "FR", Elo = 2055 },
            new() { Name = "Portugal", Country = "Portugal", CountryCode = "PT", Elo = 2030 },
            new() { Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2001 },
            new() { Name = "England", Country = "England", CountryCode = "EN", Elo = 1984 },
            new() { Name = "Netherlands", Country = "Netherlands", CountryCode = "NL", Elo = 1975 },
            new() { Name = "Colombia", Country = "Colombia", CountryCode = "CO", Elo = 1951 },
            new() { Name = "Croatia", Country = "Croatia", CountryCode = "HR", Elo = 1926 },
            new() { Name = "Germany", Country = "Germany", CountryCode = "DE", Elo = 1913 },
            new() { Name = "Ecuador", Country = "Ecuador", CountryCode = "EC", Elo = 1905 },
            new() { Name = "Uruguay", Country = "Uruguay", CountryCode = "UY", Elo = 1901 },
            new() { Name = "Italy", Country = "Italy", CountryCode = "IT", Elo = 1881 },
            new() { Name = "Japan", Country = "Japan", CountryCode = "JP", Elo = 1881 },
            new() { Name = "Mexico", Country = "Mexico", CountryCode = "MX", Elo = 1860 },
            new() { Name = "Belgium", Country = "Belgium", CountryCode = "BE", Elo = 1846 },
            new() { Name = "Morocco", Country = "Morocco", CountryCode = "MA", Elo = 1812 },
            new() { Name = "Iran", Country = "Iran", CountryCode = "IR", Elo = 1799 },
            new() { Name = "Senegal", Country = "Senegal", CountryCode = "SN", Elo = 1784 },
            new() { Name = "Australia", Country = "Australia", CountryCode = "AU", Elo = 1773 },
            new() { Name = "Canada", Country = "Canada", CountryCode = "CA", Elo = 1768 },
            new() { Name = "South Korea", Country = "South Korea", CountryCode = "KR", Elo = 1752 },
            new() { Name = "Venezuela", Country = "Venezuela", CountryCode = "VE", Elo = 1745 },
            new() { Name = "Peru", Country = "Peru", CountryCode = "PE", Elo = 1743 },
            new() { Name = "United States", Country = "United States", CountryCode = "US", Elo = 1696 },
            new() { Name = "Chile", Country = "Chile", CountryCode = "CL", Elo = 1688 },
            new() { Name = "Egypt", Country = "Egypt", CountryCode = "EG", Elo = 1667 },
            new() { Name = "Tunisia", Country = "Tunisia", CountryCode = "TN", Elo = 1614 },
            new() { Name = "Nigeria", Country = "Nigeria", CountryCode = "NG", Elo = 1578 },
            new() { Name = "Saudi Arabia", Country = "Saudi Arabia", CountryCode = "SA", Elo = 1567 },
            new() { Name = "Qatar", Country = "Qatar", CountryCode = "QA", Elo = 1517 },
            new() { Name = "Ghana", Country = "Ghana", CountryCode = "GH", Elo = 1478 }
        };

        var bulkRequest = new BulkCreateTeamsRequest { Teams = defaultTeams };
        return await BulkCreateTeamsAsync(bulkRequest);
    }

    public async Task<Result<KnockoutBracketResponse>> GenerateKnockoutBracketAsync(GenerateKnockoutBracketRequest request)
    {
        if (request.AutoFillFromGroupWinners)
        {
            // Get qualified teams (top 2 from each group)
            var groups = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .ToListAsync();

            // For now, return empty bracket - would need group standings calculation
            var bracket = new KnockoutBracketResponse();
            return Result.Success(bracket);
        }

        return Result.Success(new KnockoutBracketResponse());
    }

    public async Task<Result<KnockoutBracketResponse>> GetKnockoutBracketAsync()
    {
        var knockoutMatches = await _context.Matches
            .OfType<KnockoutMatch>()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .ToListAsync();

        var bracket = new KnockoutBracketResponse
        {
            RoundOf16 = knockoutMatches
                .Where(m => m.Round == KnockoutRound.RoundOf16)
                .Select(MapToKnockoutMatchResponse)
                .ToList(),
            QuarterFinals = knockoutMatches
                .Where(m => m.Round == KnockoutRound.QuarterFinals)
                .Select(MapToKnockoutMatchResponse)
                .ToList(),
            SemiFinals = knockoutMatches
                .Where(m => m.Round == KnockoutRound.SemiFinals)
                .Select(MapToKnockoutMatchResponse)
                .ToList(),
            ThirdPlaceMatch = knockoutMatches
                .Where(m => m.Round == KnockoutRound.ThirdPlace)
                .Select(MapToKnockoutMatchResponse)
                .FirstOrDefault(),
            Final = knockoutMatches
                .Where(m => m.Round == KnockoutRound.Final)
                .Select(MapToKnockoutMatchResponse)
                .FirstOrDefault()
        };

        return Result.Success(bracket);
    }

    private static TeamResponse MapToTeamResponse(Team team)
    {
        return new TeamResponse
        {
            Id = team.Id,
            Name = team.Name,
            Country = team.Country,
            Elo = team.Elo,
            CountryCode = team.CountryCode
        };
    }

    private static KnockoutMatchResponse MapToKnockoutMatchResponse(KnockoutMatch match)
    {
        return new KnockoutMatchResponse
        {
            Id = match.Id,
            TeamA = match.TeamA != null ? MapToTeamResponse(match.TeamA) : null,
            TeamB = match.TeamB != null ? MapToTeamResponse(match.TeamB) : null,
            ScoreA = match.ScoreA,
            ScoreB = match.ScoreB,
            PenaltyScoreA = match.PenaltyScoreA,
            PenaltyScoreB = match.PenaltyScoreB,
            WentToPenalties = match.WentToPenalties,
            Played = match.Played,
            Round = match.Round.ToString(),
            Winner = DetermineWinner(match)
        };
    }

    private static string DetermineWinner(KnockoutMatch match)
    {
        if (!match.Played) return string.Empty;
        
        if (match.WentToPenalties)
        {
            return (match.PenaltyScoreA ?? 0) > (match.PenaltyScoreB ?? 0) 
                ? match.TeamA?.Name ?? "" 
                : match.TeamB?.Name ?? "";
        }
        
        return match.ScoreA > match.ScoreB 
            ? match.TeamA?.Name ?? "" 
            : match.TeamB?.Name ?? "";
    }
}