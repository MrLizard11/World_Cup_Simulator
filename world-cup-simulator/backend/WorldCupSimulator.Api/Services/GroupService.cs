using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
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

        public async Task<IEnumerable<GroupResponse>> GetGroupsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .ToListAsync();

            return groups.Select(g => MapToGroupResponse(g));
        }

        public async Task<GroupResponse?> GetGroupByIdAsync(int id)
        {
            var group = await _context.Groups
                .Include(g => g.Teams)
                    .ThenInclude(gt => gt.Team)
                .Include(g => g.Matches)
                .FirstOrDefaultAsync(g => g.Id == id);

            return group == null ? null : MapToGroupResponse(group);
        }

        public async Task<GroupResponse> CreateGroupAsync(Group group)
        {
            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return MapToGroupResponse(group);
        }

        public async Task<List<GroupTeamResponse>> AddTeamsToGroupAsync(int groupId, AddTeamsToGroupRequest request)
        {
            var group = await _context.Groups.FindAsync(groupId);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group with ID {groupId} not found");
            }

            var teams = await _context.Teams
                .Where(t => request.TeamIds.Contains(t.Id))
                .ToListAsync();

            if (teams.Count != request.TeamIds.Count)
            {
                var foundIds = teams.Select(t => t.Id);
                var missingIds = request.TeamIds.Where(id => !foundIds.Contains(id));
                throw new ArgumentException($"Teams not found: {string.Join(", ", missingIds)}");
            }

            var existingTeams = await _context.GroupTeams
                .Where(gt => gt.GroupId == groupId && request.TeamIds.Contains(gt.TeamId))
                .Select(gt => gt.TeamId)
                .ToListAsync();

            if (existingTeams.Any())
            {
                throw new InvalidOperationException(
                    $"Teams with IDs {string.Join(", ", existingTeams)} are already in this group");
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

            return groupTeamResponses;
        }

        public async Task UpdateGroupAsync(int id, Group group)
        {
            if (id != group.Id)
            {
                throw new ArgumentException("ID mismatch");
            }

            _context.Entry(group).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await GroupExistsAsync(id))
                {
                    throw new KeyNotFoundException($"Group with ID {id} not found");
                }
                throw;
            }
        }

        public async Task DeleteGroupAsync(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null)
            {
                throw new KeyNotFoundException($"Group with ID {id} not found");
            }

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
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
