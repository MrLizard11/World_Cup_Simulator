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
            if (id != group.Id)
            {
                return Result.Failure(new Error("Groups.IdMismatch", "ID mismatch"));
            }

            if (string.IsNullOrWhiteSpace(group.Name))
            {
                return Result.Failure(GroupErrors.InvalidName);
            }

            if (!await GroupExistsAsync(id))
            {
                return Result.Failure(GroupErrors.NotFound(id));
            }

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
    }
}
