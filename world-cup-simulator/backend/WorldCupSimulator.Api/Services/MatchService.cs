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

        public MatchService(WorldCupContext context)
        {
            _context = context;
        }

        public async Task<Result<IEnumerable<Match>>> GetMatchesAsync()
        {
            var matches = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .ToListAsync();

            return Result.Success<IEnumerable<Match>>(matches);
        }

        public async Task<Result<Match>> GetMatchByIdAsync(int id)
        {
            var match = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (match == null)
            {
                return Result.Failure<Match>(MatchErrors.NotFound(id));
            }

            return Result.Success(match);
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

            if (request.GroupId.HasValue)
            {
                var group = await _context.Groups.FindAsync(request.GroupId.Value);
                if (group == null)
                {
                    return Result.Failure<Match>(GroupErrors.NotFound(request.GroupId.Value));
                }
            }

            var match = new GroupMatch
            {
                TeamAId = request.TeamAId,
                TeamBId = request.TeamBId,
                GroupId = request.GroupId,
                ScoreA = request.ScoreA,
                ScoreB = request.ScoreB,
                Played = request.Played,
                MatchType = "Group"
            };

            _context.Matches.Add(match);
            await _context.SaveChangesAsync();

            var createdMatch = await _context.Matches
                .Include(m => m.TeamA)
                .Include(m => m.TeamB)
                .Include(m => m.Group)
                .FirstOrDefaultAsync(m => m.Id == match.Id);

            return Result.Success(createdMatch!);
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
    }
}