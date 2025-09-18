using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Common;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
using WorldCupSimulator.Api.Errors;
using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services
{
    public class TeamService : ITeamService
    {
        private readonly WorldCupContext _context;

        public TeamService(WorldCupContext context)
        {
            _context = context;
        }

        public async Task<Result<IEnumerable<TeamResponse>>> GetTeamsAsync()
        {
            var teams = await _context.Teams.ToListAsync();
            var response = teams.Select(MapToTeamResponse);
            return Result.Success<IEnumerable<TeamResponse>>(response);
        }

        public async Task<Result<TeamResponse>> GetTeamByIdAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                return Result.Failure<TeamResponse>(TeamErrors.NotFound(id));
            }
            return Result.Success(MapToTeamResponse(team));
        }

        public async Task<Result<TeamResponse>> CreateTeamAsync(CreateTeamRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Result.Failure<TeamResponse>(TeamErrors.InvalidName);
            }

            var existingTeam = await _context.Teams.FirstOrDefaultAsync(t => t.Name == request.Name);
            if (existingTeam != null)
            {
                return Result.Failure<TeamResponse>(TeamErrors.DuplicateName);
            }

            var team = new Team
            {
                Name = request.Name,
                Country = request.Country,
                Elo = request.Elo,
                CountryCode = request.CountryCode
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return Result.Success(MapToTeamResponse(team));
        }

        public async Task<Result<TeamResponse>> UpdateTeamAsync(int id, UpdateTeamRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Result.Failure<TeamResponse>(TeamErrors.InvalidName);
            }

            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                return Result.Failure<TeamResponse>(TeamErrors.NotFound(id));
            }

            var existingTeam = await _context.Teams.FirstOrDefaultAsync(t => t.Name == request.Name && t.Id != id);
            if (existingTeam != null)
            {
                return Result.Failure<TeamResponse>(TeamErrors.DuplicateName);
            }

            team.Name = request.Name;
            team.Country = request.Country;
            team.Elo = request.Elo;
            team.CountryCode = request.CountryCode;

            await _context.SaveChangesAsync();

            return Result.Success(MapToTeamResponse(team));
        }

        public async Task<Result> DeleteTeamAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                return Result.Failure(TeamErrors.NotFound(id));
            }

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
            return Result.Success();
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
    }
}
