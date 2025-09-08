using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.DTOs;
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

        public async Task<IEnumerable<TeamResponse>> GetTeamsAsync()
        {
            var teams = await _context.Teams.ToListAsync();
            return teams.Select(MapToTeamResponse);
        }

        public async Task<TeamResponse?> GetTeamByIdAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            return team == null ? null : MapToTeamResponse(team);
        }

        public async Task<TeamResponse> CreateTeamAsync(CreateTeamRequest request)
        {
            var team = new Team
            {
                Name = request.Name,
                Country = request.Country,
                Elo = request.Elo,
                CountryCode = request.CountryCode
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return MapToTeamResponse(team);
        }

        public async Task<TeamResponse> UpdateTeamAsync(int id, UpdateTeamRequest request)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                throw new KeyNotFoundException($"Team with ID {id} not found");
            }

            // Only update the allowed fields
            team.Name = request.Name;
            team.Country = request.Country;
            team.Elo = request.Elo;
            team.CountryCode = request.CountryCode;

            await _context.SaveChangesAsync();

            return MapToTeamResponse(team);
        }

        public async Task DeleteTeamAsync(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                throw new KeyNotFoundException($"Team with ID {id} not found");
            }

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
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
