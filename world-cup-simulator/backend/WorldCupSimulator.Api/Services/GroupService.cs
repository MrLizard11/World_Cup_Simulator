using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Errors;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public class GroupService : IGroupService
    {
        private readonly WorldCupContext _context;

        public GroupService(WorldCupContext context)
        {
            _context = context;
        }

        public async Task<Result<IEnumerable<GroupResponse>>> GetGroupsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .ToListAsync();

            var response = groups.Select(g => MapToGroupResponse(g));
            return Result.Success<IEnumerable<GroupResponse>>(response);
        }

        public async Task<Result<GroupResponse>> GetGroupByIdAsync(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
            {
                return Result.Failure<GroupResponse>(GroupErrors.NotFound(id));
            }

            return Result.Success(MapToGroupResponse(group));
        }

        public async Task<Result<GroupResponse>> CreateGroupAsync(Group group)
        {
            if (string.IsNullOrWhiteSpace(group.Name))
            {
                return Result.Failure<GroupResponse>(GroupErrors.InvalidName);
            }

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return Result.Success(MapToGroupResponse(group));
        }

        public async Task<Result<List<GroupTeamResponse>>> AddTeamsToGroupAsync(int groupId, AddTeamsToGroupRequest request)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
            {
                return Result.Failure<List<GroupTeamResponse>>(GroupErrors.NotFound(groupId));
            }

            var teams = await _context.Teams
                .Where(t => request.TeamIds.Contains(t.Id))
                .ToListAsync();

            if (teams.Count != request.TeamIds.Count)
            {
                var foundIds = teams.Select(t => t.Id);
                var missingIds = request.TeamIds.Where(id => !foundIds.Contains(id));
                return Result.Failure<List<GroupTeamResponse>>(GroupErrors.TeamsNotFound(missingIds));
            }

            var existingTeams = await _context.GroupTeams
                .Where(gt => gt.GroupId == groupId && request.TeamIds.Contains(gt.TeamId))
                .Select(gt => gt.TeamId)
                .ToListAsync();

            if (existingTeams.Any())
            {
                return Result.Failure<List<GroupTeamResponse>>(GroupErrors.TeamsAlreadyInGroup(existingTeams));
            }

            var groupTeams = request.TeamIds.Select(teamId => new GroupTeam
            {
                GroupId = groupId,
                TeamId = teamId,
                Points = 0,
                MatchesPlayed = 0,
                Wins = 0,
                Draws = 0,
                Losses = 0,
                GoalsFor = 0,
                GoalsAgainst = 0,
                GoalDifference = 0
            }).ToList();

            _context.GroupTeams.AddRange(groupTeams);
            await _context.SaveChangesAsync();

            var groupTeamResponses = await _context.GroupTeams
                .Include(gt => gt.Team)
                .Where(gt => gt.GroupId == groupId && request.TeamIds.Contains(gt.TeamId))
                .Select(gt => new GroupTeamResponse
                {
                    GroupId = gt.GroupId,
                    TeamId = gt.TeamId,
                    TeamName = gt.Team.Name,
                    TeamCountry = gt.Team.Country,
                    TeamCountryCode = gt.Team.CountryCode,
                    TeamElo = gt.Team.Elo,
                    Points = gt.Points,
                    MatchesPlayed = gt.MatchesPlayed,
                    Wins = gt.Wins,
                    Draws = gt.Draws,
                    Losses = gt.Losses,
                    GoalsFor = gt.GoalsFor,
                    GoalsAgainst = gt.GoalsAgainst,
                    GoalDifference = gt.GoalDifference
                })
                .ToListAsync();

            return Result.Success(groupTeamResponses);
        }

        public async Task<Result> UpdateGroupAsync(int id, Group group)
        {
            if (string.IsNullOrWhiteSpace(group.Name))
            {
                return Result.Failure(GroupErrors.InvalidName);
            }

            if (!await GroupExistsAsync(id))
            {
                return Result.Failure(GroupErrors.NotFound(id));
            }

            // Set the ID from the URL parameter to ensure consistency
            group.Id = id;
            _context.Entry(group).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Result.Success();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Re-check if the group still exists after concurrency exception
                if (!await GroupExistsAsync(id))
                {
                    return Result.Failure(GroupErrors.NotFound(id));
                }
                return Result.Failure(new Error("Groups.ConcurrencyError", "A concurrency error occurred while updating the group"));
            }
        }

        public async Task<Result> DeleteGroupAsync(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null)
            {
                return Result.Failure(GroupErrors.NotFound(id));
            }

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();

            // Reset identity counter if no groups remain
            var remainingGroupsCount = await _context.Groups.CountAsync();
            if (remainingGroupsCount == 0)
            {
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT ('Groups', RESEED, 0)");
            }

            return Result.Success();
        }

        private async Task<bool> GroupExistsAsync(int id)
        {
            return await _context.Groups.AnyAsync(e => e.Id == id);
        }

        private static GroupResponse MapToGroupResponse(Group group)
        {
            return new GroupResponse
            {
                Id = group.Id,
                Name = group.Name,
                Teams = group.Teams.Select(gt => new GroupTeamResponse
                {
                    GroupId = gt.GroupId,
                    TeamId = gt.TeamId,
                    TeamName = gt.Team.Name,
                    TeamCountry = gt.Team.Country,
                    TeamCountryCode = gt.Team.CountryCode,
                    TeamElo = gt.Team.Elo,
                    Points = gt.Points,
                    MatchesPlayed = gt.MatchesPlayed,
                    Wins = gt.Wins,
                    Draws = gt.Draws,
                    Losses = gt.Losses,
                    GoalsFor = gt.GoalsFor,
                    GoalsAgainst = gt.GoalsAgainst,
                    GoalDifference = gt.GoalDifference
                }).ToList(),
                Matches = group.Matches.Select(m => new GroupMatchResponse
                {
                    Id = m.Id,
                    TeamAId = m.TeamA.Id,
                    TeamAName = m.TeamA.Name,
                    TeamACountryCode = m.TeamA.CountryCode,
                    TeamBId = m.TeamB.Id,
                    TeamBName = m.TeamB.Name,
                    TeamBCountryCode = m.TeamB.CountryCode,
                    ScoreA = m.ScoreA,
                    ScoreB = m.ScoreB,
                    Played = m.Played,
                    GroupId = m.GroupId ?? group.Id
                }).ToList()
            };
        }

        public async Task<Result<GroupStandingsResponse>> GetGroupStandingsAsync(int groupId)
        {
            var group = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
            {
                return Result.Failure<GroupStandingsResponse>(GroupErrors.NotFound(groupId));
            }

            var standings = CalculateGroupStandings(group);
            return Result.Success(standings);
        }

        public async Task<Result<IEnumerable<GroupStandingsResponse>>> GetAllGroupStandingsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .ToListAsync();

            var allStandings = groups.Select(CalculateGroupStandings);
            return Result.Success<IEnumerable<GroupStandingsResponse>>(allStandings);
        }

        public async Task<Result<IEnumerable<TeamStandingResponse>>> GetQualifiedTeamsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .ToListAsync();

            var qualifiedTeams = new List<TeamStandingResponse>();

            foreach (var group in groups)
            {
                var standings = CalculateGroupStandings(group);
                // Take top 2 teams from each group
                qualifiedTeams.AddRange(standings.Standings.Take(2));
            }

            return Result.Success<IEnumerable<TeamStandingResponse>>(qualifiedTeams);
        }

        private GroupStandingsResponse CalculateGroupStandings(Group group)
        {
            var teamStats = new Dictionary<int, TeamStandingResponse>();

            // Initialize team standings
            foreach (var groupTeam in group.Teams)
            {
                teamStats[groupTeam.TeamId] = new TeamStandingResponse
                {
                    TeamId = groupTeam.TeamId,
                    TeamName = groupTeam.Team.Name,
                    Country = groupTeam.Team.Country,
                    CountryCode = groupTeam.Team.CountryCode,
                    Elo = groupTeam.Team.Elo,
                    Points = 0,
                    MatchesPlayed = 0,
                    Wins = 0,
                    Draws = 0,
                    Losses = 0,
                    GoalsFor = 0,
                    GoalsAgainst = 0,
                    GoalDifference = 0,
                    Position = 0
                };
            }

            // Process all played matches
            foreach (var match in group.Matches.Where(m => m.Played))
            {
                if (teamStats.TryGetValue(match.TeamAId, out var teamA) && 
                    teamStats.TryGetValue(match.TeamBId, out var teamB))
                {
                    // Update matches played
                    teamA.MatchesPlayed++;
                    teamB.MatchesPlayed++;

                    // Update goals
                    teamA.GoalsFor += match.ScoreA;
                    teamA.GoalsAgainst += match.ScoreB;
                    teamB.GoalsFor += match.ScoreB;
                    teamB.GoalsAgainst += match.ScoreA;

                    // Update goal difference
                    teamA.GoalDifference = teamA.GoalsFor - teamA.GoalsAgainst;
                    teamB.GoalDifference = teamB.GoalsFor - teamB.GoalsAgainst;

                    // Update points and win/draw/loss
                    if (match.ScoreA > match.ScoreB)
                    {
                        // Team A wins
                        teamA.Wins++;
                        teamA.Points += 3;
                        teamB.Losses++;
                    }
                    else if (match.ScoreB > match.ScoreA)
                    {
                        // Team B wins
                        teamB.Wins++;
                        teamB.Points += 3;
                        teamA.Losses++;
                    }
                    else
                    {
                        // Draw
                        teamA.Draws++;
                        teamB.Draws++;
                        teamA.Points += 1;
                        teamB.Points += 1;
                    }
                }
            }

            // Sort teams by FIFA World Cup tiebreaker rules
            var sortedStandings = teamStats.Values
                .OrderByDescending(t => t.Points)                    // 1. Points
                .ThenByDescending(t => t.GoalDifference)             // 2. Goal difference
                .ThenByDescending(t => t.GoalsFor)                   // 3. Goals for
                .ThenByDescending(t => t.Wins)                       // 4. Most wins
                .ThenBy(t => t.TeamName)                             // 5. Alphabetical (for consistency)
                .ToList();

            // Assign positions
            for (int i = 0; i < sortedStandings.Count; i++)
            {
                sortedStandings[i].Position = i + 1;
            }

            return new GroupStandingsResponse
            {
                GroupId = group.Id,
                GroupName = group.Name,
                Standings = sortedStandings
            };
        }
    }
}
