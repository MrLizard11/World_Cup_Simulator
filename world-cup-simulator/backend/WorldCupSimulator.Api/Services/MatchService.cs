using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Errors;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public class MatchService : IMatchService
    {
        private readonly WorldCupContext _context;
        private readonly ISimulationService _simulationService;

        public MatchService(WorldCupContext context, ISimulationService simulationService)
        {
            _context = context;
            _simulationService = simulationService;
        }

        public async Task<Result<IEnumerable<Match>>> GetMatchesAsync()
        {
            // Get group matches with their groups
            var groupMatches = await _context.Set<GroupMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .ToListAsync();

            // Get knockout matches (if any exist)
            var knockoutMatches = await _context.Set<KnockoutMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .ToListAsync();

            // Combine both types
            var allMatches = new List<Match>();
            allMatches.AddRange(groupMatches);
            allMatches.AddRange(knockoutMatches);

            return Result.Success<IEnumerable<Match>>(allMatches);
        }

        public async Task<Result<Match>> GetMatchByIdAsync(int id)
        {
            // Try to find as GroupMatch first
            var groupMatch = await _context.Set<GroupMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (groupMatch != null)
            {
                return Result.Success<Match>(groupMatch);
            }

            // Try to find as KnockoutMatch
            var knockoutMatch = await _context.Set<KnockoutMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (knockoutMatch != null)
            {
                return Result.Success<Match>(knockoutMatch);
            }

            return Result.Failure<Match>(MatchErrors.NotFound(id));
        }

        public async Task<Result<IEnumerable<KnockoutMatch>>> GetKnockoutMatchesAsync()
        {
            var matches = await _context.Matches
                .OfType<KnockoutMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .ToListAsync();

            return Result.Success<IEnumerable<KnockoutMatch>>(matches);
        }

        public async Task<Result<IEnumerable<Match>>> GetMatchesByGroupAsync(int groupId)
        {
            var matches = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Where(m => m.GroupId == groupId)
                .ToListAsync();

            return Result.Success<IEnumerable<Match>>(matches);
        }

        public async Task<Result<Match>> CreateMatchAsync(CreateMatchRequest request)
        {
            if (request.TeamAId == request.TeamBId)
            {
                return Result.Failure<Match>(MatchErrors.SameTeam);
            }

            var teamA = await _context.Teams.FindAsync(request.TeamAId);
            if (teamA == null)
            {
                return Result.Failure<Match>(TeamErrors.NotFound(request.TeamAId));
            }

            var teamB = await _context.Teams.FindAsync(request.TeamBId);
            if (teamB == null)
            {
                return Result.Failure<Match>(TeamErrors.NotFound(request.TeamBId));
            }

            // For group matches, GroupId is required
            if (!request.GroupId.HasValue)
            {
                return Result.Failure<Match>(new Error("Match.GroupIdRequired", "GroupId is required for match creation"));
            }

            var group = await _context.Groups.FindAsync(request.GroupId.Value);
            if (group == null)
            {
                return Result.Failure<Match>(GroupErrors.NotFound(request.GroupId.Value));
            }

            var match = new GroupMatch
            {
                TeamAId = request.TeamAId,
                TeamBId = request.TeamBId,
                GroupId = request.GroupId.Value, // Ensure non-nullable assignment
                ScoreA = request.ScoreA,
                ScoreB = request.ScoreB,
                Played = request.Played,
                MatchType = "Group"
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            var createdMatch = await _context.Set<GroupMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .FirstOrDefaultAsync(m => m.Id == match.Id);

            return Result.Success<Match>(createdMatch!);
        }

        public async Task<Result<KnockoutMatch>> CreateKnockoutMatchAsync(CreateKnockoutMatchRequest request)
        {
            if (request.TeamAId == request.TeamBId)
            {
                return Result.Failure<KnockoutMatch>(MatchErrors.SameTeam);
            }

            var teamA = await _context.Teams.FindAsync(request.TeamAId);
            if (teamA == null)
            {
                return Result.Failure<KnockoutMatch>(TeamErrors.NotFound(request.TeamAId));
            }

            var teamB = await _context.Teams.FindAsync(request.TeamBId);
            if (teamB == null)
            {
                return Result.Failure<KnockoutMatch>(TeamErrors.NotFound(request.TeamBId));
            }

            var knockoutMatch = new KnockoutMatch
            {
                TeamAId = request.TeamAId,
                TeamBId = request.TeamBId,
                ScoreA = request.ScoreA,
                ScoreB = request.ScoreB,
                Played = request.Played,
                WentToPenalties = request.WentToPenalties,
                PenaltyScoreA = request.PenaltyScoreA,
                PenaltyScoreB = request.PenaltyScoreB,
                Round = Enum.Parse<KnockoutRound>(request.Round),
                MatchType = "Knockout"
            };

            _context.Matches.Add(knockoutMatch);
            await _context.SaveChangesAsync();

            var createdMatch = await _context.Matches
                .OfType<KnockoutMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .FirstOrDefaultAsync(m => m.Id == knockoutMatch.Id);

            return Result.Success(createdMatch!);
        }

        public async Task<Result> DeleteMatchAsync(int id)
        {
            var match = await _context.Matches.FindAsync(id);
            if (match == null)
            {
                return Result.Failure(MatchErrors.NotFound(id));
            }

            _context.Matches.Remove(match);
            await _context.SaveChangesAsync();
            return Result.Success();
        }

        public async Task<Result<IEnumerable<Match>>> GenerateGroupMatchesAsync(int groupId)
        {
            var group = await _context.Groups
                .Include(g => g.Teams)
                .ThenInclude(gt => gt.Team)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
            {
                return Result.Failure<IEnumerable<Match>>(GroupErrors.NotFound(groupId));
            }

            var teams = group.Teams.Select(gt => gt.Team).ToList();
            if (teams.Count != 4)
            {
                return Result.Failure<IEnumerable<Match>>(new Error("Group.InsufficientTeams", $"Group must have exactly 4 teams to generate matches. Found {teams.Count} teams."));
            }

            var matches = new List<GroupMatch>();

            // Generate all possible combinations (round-robin)
            for (int i = 0; i < teams.Count; i++)
            {
                for (int j = i + 1; j < teams.Count; j++)
                {
                    var match = new GroupMatch
                    {
                        TeamAId = teams[i].Id,
                        TeamBId = teams[j].Id,
                        GroupId = groupId,
                        ScoreA = 0,
                        ScoreB = 0,
                        Played = false,
                        MatchType = "Group"
                    };
                    matches.Add(match);
                }
            }

            _context.Matches.AddRange(matches);
            await _context.SaveChangesAsync();

            // Return the created matches with navigation properties
            var createdMatches = await _context.Set<GroupMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .Where(m => matches.Select(match => match.Id).Contains(m.Id))
                .ToListAsync();

            return Result.Success<IEnumerable<Match>>(createdMatches);
        }

        public async Task<Result<Match>> SimulateMatchAsync(int matchId, SimulationMode mode = SimulationMode.EloRealistic)
        {
            var match = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (match == null)
            {
                return Result.Failure<Match>(MatchErrors.NotFound(matchId));
            }

            if (match.Played)
            {
                return Result.Failure<Match>(MatchErrors.AlreadyPlayed(matchId));
            }

            // Simulate the match
            var (scoreA, scoreB) = _simulationService.SimulateMatch(match.TeamA, match.TeamB, mode);

            // Update match with results
            match.ScoreA = scoreA;
            match.ScoreB = scoreB;
            match.Played = true;

            // Update team Elo ratings
            var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(match.TeamA, match.TeamB, scoreA, scoreB);
            
            // Update teams in database
            _context.Entry(match.TeamA).CurrentValues.SetValues(updatedTeamA);
            _context.Entry(match.TeamB).CurrentValues.SetValues(updatedTeamB);

            await _context.SaveChangesAsync();

            return Result.Success(match);
        }

        public async Task<Result<IEnumerable<Match>>> SimulateAllGroupMatchesAsync(int groupId, SimulationMode mode = SimulationMode.EloRealistic)
        {
            var matches = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Where(m => m.GroupId == groupId && !m.Played)
                .ToListAsync();

            if (!matches.Any())
            {
                return Result.Success<IEnumerable<Match>>(matches);
            }

            foreach (var match in matches)
            {
                // Simulate the match
                var (scoreA, scoreB) = _simulationService.SimulateMatch(match.TeamA, match.TeamB, mode);

                // Update match with results
                match.ScoreA = scoreA;
                match.ScoreB = scoreB;
                match.Played = true;

                // Update team Elo ratings
                var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(match.TeamA, match.TeamB, scoreA, scoreB);
                
                // Update teams in database
                _context.Entry(match.TeamA).CurrentValues.SetValues(updatedTeamA);
                _context.Entry(match.TeamB).CurrentValues.SetValues(updatedTeamB);
            }

            await _context.SaveChangesAsync();

            return Result.Success<IEnumerable<Match>>(matches);
        }

        public async Task<Result<IEnumerable<Match>>> SimulateAllGroupStageAsync(SimulationMode mode = SimulationMode.EloRealistic)
        {
            var matches = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Where(m => m.GroupId != null && !m.Played) // Group matches only
                .ToListAsync();

            if (!matches.Any())
            {
                return Result.Success<IEnumerable<Match>>(matches);
            }

            foreach (var match in matches)
            {
                // Simulate the match
                var (scoreA, scoreB) = _simulationService.SimulateMatch(match.TeamA, match.TeamB, mode);

                // Update match with results
                match.ScoreA = scoreA;
                match.ScoreB = scoreB;
                match.Played = true;

                // Update team Elo ratings
                var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(match.TeamA, match.TeamB, scoreA, scoreB);
                
                // Update teams in database
                _context.Entry(match.TeamA).CurrentValues.SetValues(updatedTeamA);
                _context.Entry(match.TeamB).CurrentValues.SetValues(updatedTeamB);
            }

            await _context.SaveChangesAsync();

            return Result.Success<IEnumerable<Match>>(matches);
        }

        public async Task<Result<KnockoutMatch>> SimulateKnockoutMatchAsync(int matchId, SimulationMode mode = SimulationMode.EloRealistic)
        {
            var knockoutMatch = await _context.Matches
                .OfType<KnockoutMatch>()
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .FirstOrDefaultAsync(m => m.Id == matchId);

            if (knockoutMatch == null)
            {
                return Result.Failure<KnockoutMatch>(MatchErrors.NotFound(matchId));
            }

            if (knockoutMatch.Played)
            {
                return Result.Failure<KnockoutMatch>(MatchErrors.AlreadyPlayed(matchId));
            }

            // Simulate the match
            var (scoreA, scoreB) = _simulationService.SimulateMatch(knockoutMatch.TeamA, knockoutMatch.TeamB, mode);

            // Update match with results
            knockoutMatch.ScoreA = scoreA;
            knockoutMatch.ScoreB = scoreB;
            knockoutMatch.Played = true;

            // Handle penalties for knockout matches if it's a draw
            if (scoreA == scoreB)
            {
                knockoutMatch.WentToPenalties = true;
                // Simulate penalty shootout
                var penaltyA = _simulationService.SimulateMatch(knockoutMatch.TeamA, knockoutMatch.TeamB, SimulationMode.Random).scoreA % 6; // 0-5 penalties
                var penaltyB = _simulationService.SimulateMatch(knockoutMatch.TeamA, knockoutMatch.TeamB, SimulationMode.Random).scoreB % 6;
                
                // Ensure there's a winner
                if (penaltyA == penaltyB)
                {
                    penaltyA = penaltyA == 5 ? 4 : penaltyA + 1; // One team must win
                }

                knockoutMatch.PenaltyScoreA = penaltyA;
                knockoutMatch.PenaltyScoreB = penaltyB;
            }

            // Update team Elo ratings (with bonus for knockout wins)
            var kFactor = knockoutMatch.WentToPenalties ? 20 : 40; // Less Elo change for penalty wins
            var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(knockoutMatch.TeamA, knockoutMatch.TeamB, scoreA, scoreB, kFactor);
            
            // Update teams in database
            _context.Entry(knockoutMatch.TeamA).CurrentValues.SetValues(updatedTeamA);
            _context.Entry(knockoutMatch.TeamB).CurrentValues.SetValues(updatedTeamB);

            await _context.SaveChangesAsync();

            return Result.Success(knockoutMatch);
        }
    }
}