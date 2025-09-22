using Microsoft.EntityFrameworkCore;
using WorldCupSimulator.Api.Data;
using WorldCupSimulator.Api.Models;
using WorldCupSimulator.Api.Services;
using Xunit;

namespace WorldCupSimulator.Tests;

public class GroupServiceTests : IDisposable
{
    private readonly WorldCupContext _context;
    private readonly GroupService _groupService;

    public GroupServiceTests()
    {
        var options = new DbContextOptionsBuilder<WorldCupContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new WorldCupContext(options);
        _groupService = new GroupService(_context);
    }

    [Fact]
    public void CalculateGroupStandings_WithNoMatches_ReturnsTeamsWithZeroStats()
    {
        // Arrange
        var group = CreateGroupWithTeams();

        // Act
        var standings = _groupService.CalculateGroupStandings(group);

        // Assert
        Assert.Equal(4, standings.Standings.Count);
        foreach (var teamStanding in standings.Standings)
        {
            Assert.Equal(0, teamStanding.Points);
            Assert.Equal(0, teamStanding.MatchesPlayed);
            Assert.Equal(0, teamStanding.Wins);
            Assert.Equal(0, teamStanding.Draws);
            Assert.Equal(0, teamStanding.Losses);
            Assert.Equal(0, teamStanding.GoalsFor);
            Assert.Equal(0, teamStanding.GoalsAgainst);
            Assert.Equal(0, teamStanding.GoalDifference);
        }
    }

    [Fact]
    public void CalculateGroupStandings_WithOneWin_UpdatesPointsAndStats()
    {
        // Arrange
        var group = CreateGroupWithTeams();
        var match = new GroupMatch
        {
            Id = 1,
            TeamAId = 1, // Brazil
            TeamBId = 2, // Argentina
            ScoreA = 2,
            ScoreB = 1,
            Played = true,
            GroupId = group.Id
        };
        group.Matches.Add(match);

        // Act
        var standings = _groupService.CalculateGroupStandings(group);

        // Assert
        var brazilStanding = standings.Standings.First(s => s.TeamId == 1);
        var argentinaStanding = standings.Standings.First(s => s.TeamId == 2);

        // Brazil (winner)
        Assert.Equal(3, brazilStanding.Points);
        Assert.Equal(1, brazilStanding.MatchesPlayed);
        Assert.Equal(1, brazilStanding.Wins);
        Assert.Equal(0, brazilStanding.Draws);
        Assert.Equal(0, brazilStanding.Losses);
        Assert.Equal(2, brazilStanding.GoalsFor);
        Assert.Equal(1, brazilStanding.GoalsAgainst);
        Assert.Equal(1, brazilStanding.GoalDifference);

        // Argentina (loser)
        Assert.Equal(0, argentinaStanding.Points);
        Assert.Equal(1, argentinaStanding.MatchesPlayed);
        Assert.Equal(0, argentinaStanding.Wins);
        Assert.Equal(0, argentinaStanding.Draws);
        Assert.Equal(1, argentinaStanding.Losses);
        Assert.Equal(1, argentinaStanding.GoalsFor);
        Assert.Equal(2, argentinaStanding.GoalsAgainst);
        Assert.Equal(-1, argentinaStanding.GoalDifference);
    }

    [Fact]
    public void CalculateGroupStandings_WithDraw_UpdatesPointsCorrectly()
    {
        // Arrange
        var group = CreateGroupWithTeams();
        var match = new GroupMatch
        {
            Id = 1,
            TeamAId = 1, // Brazil
            TeamBId = 2, // Argentina
            ScoreA = 1,
            ScoreB = 1,
            Played = true,
            GroupId = group.Id
        };
        group.Matches.Add(match);

        // Act
        var standings = _groupService.CalculateGroupStandings(group);

        // Assert
        var brazilStanding = standings.Standings.First(s => s.TeamId == 1);
        var argentinaStanding = standings.Standings.First(s => s.TeamId == 2);

        // Both teams get 1 point for draw
        Assert.Equal(1, brazilStanding.Points);
        Assert.Equal(1, argentinaStanding.Points);
        Assert.Equal(1, brazilStanding.Draws);
        Assert.Equal(1, argentinaStanding.Draws);
        Assert.Equal(0, brazilStanding.GoalDifference);
        Assert.Equal(0, argentinaStanding.GoalDifference);
    }

    [Fact]
    public void CalculateGroupStandings_SortsTeamsByFIFATiebreakers()
    {
        // Arrange - Create scenario testing FIFA tiebreaker rules
        var group = CreateGroupWithTeams();
        
        // Add matches to create specific standings scenario:
        // Team 1 (Brazil): 6 points, +2 GD, 4 GF
        // Team 2 (Argentina): 6 points, +2 GD, 3 GF
        // Team 3 (France): 3 points, 0 GD, 2 GF
        // Team 4 (Germany): 0 points, -4 GD, 1 GF

        var matches = new List<GroupMatch>
        {
            // Brazil 2-1 Argentina (Brazil wins)
            new() { Id = 1, TeamAId = 1, TeamBId = 2, ScoreA = 2, ScoreB = 1, Played = true, GroupId = group.Id },
            // Brazil 2-0 Germany (Brazil wins) 
            new() { Id = 2, TeamAId = 1, TeamBId = 4, ScoreA = 2, ScoreB = 0, Played = true, GroupId = group.Id },
            // Argentina 2-0 France (Argentina wins)
            new() { Id = 3, TeamAId = 2, TeamBId = 3, ScoreA = 2, ScoreB = 0, Played = true, GroupId = group.Id },
            // France 2-1 Germany (France wins)
            new() { Id = 4, TeamAId = 3, TeamBId = 4, ScoreA = 2, ScoreB = 1, Played = true, GroupId = group.Id },
            // France 0-0 Brazil (Draw)
            new() { Id = 5, TeamAId = 3, TeamBId = 1, ScoreA = 0, ScoreB = 0, Played = true, GroupId = group.Id },
            // Argentina 0-0 Germany (Draw)
            new() { Id = 6, TeamAId = 2, TeamBId = 4, ScoreA = 0, ScoreB = 0, Played = true, GroupId = group.Id }
        };

        foreach (var match in matches)
        {
            group.Matches.Add(match);
        }

        // Act
        var standings = _groupService.CalculateGroupStandings(group);

        // Assert - Check FIFA tiebreaker order
        Assert.Equal(4, standings.Standings.Count);
        
        // 1st: Brazil (7 points, +2 GD, 4 GF)
        Assert.Equal(1, standings.Standings[0].TeamId);
        Assert.Equal(1, standings.Standings[0].Position);
        Assert.Equal(7, standings.Standings[0].Points);
        
        // 2nd: Argentina (4 points, +1 GD, 3 GF)
        Assert.Equal(2, standings.Standings[1].TeamId);
        Assert.Equal(2, standings.Standings[1].Position);
        Assert.Equal(4, standings.Standings[1].Points);
        
        // 3rd: France (4 points, +1 GD, 2 GF) - loses to Argentina on goals for
        Assert.Equal(3, standings.Standings[2].TeamId);
        Assert.Equal(3, standings.Standings[2].Position);
        Assert.Equal(4, standings.Standings[2].Points);
        
        // 4th: Germany (1 point, -4 GD, 1 GF)
        Assert.Equal(4, standings.Standings[3].TeamId);
        Assert.Equal(4, standings.Standings[3].Position);
        Assert.Equal(1, standings.Standings[3].Points);
    }

    [Fact]
    public void CalculateGroupStandings_IgnoresUnplayedMatches()
    {
        // Arrange
        var group = CreateGroupWithTeams();
        var playedMatch = new GroupMatch
        {
            Id = 1,
            TeamAId = 1,
            TeamBId = 2,
            ScoreA = 2,
            ScoreB = 1,
            Played = true,
            GroupId = group.Id
        };
        var unplayedMatch = new GroupMatch
        {
            Id = 2,
            TeamAId = 3,
            TeamBId = 4,
            ScoreA = 5, // High score that would affect standings if counted
            ScoreB = 0,
            Played = false, 
            GroupId = group.Id
        };
        
        group.Matches.Add(playedMatch);
        group.Matches.Add(unplayedMatch);

        // Act
        var standings = _groupService.CalculateGroupStandings(group);

        // Assert - Only played match should affect standings
        var franceStanding = standings.Standings.First(s => s.TeamId == 3);
        var germanyStanding = standings.Standings.First(s => s.TeamId == 4);
        
        Assert.Equal(0, franceStanding.Points);
        Assert.Equal(0, germanyStanding.Points);
        Assert.Equal(0, franceStanding.MatchesPlayed);
        Assert.Equal(0, germanyStanding.MatchesPlayed);
    }

    private Group CreateGroupWithTeams()
    {
        var teams = new List<Team>
        {
            new() { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2100 },
            new() { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 2080 },
            new() { Id = 3, Name = "France", Country = "France", CountryCode = "FR", Elo = 2060 },
            new() { Id = 4, Name = "Germany", Country = "Germany", CountryCode = "DE", Elo = 1960 }
        };

        var groupTeams = teams.Select(team => new GroupTeam
        {
            GroupId = 1,
            TeamId = team.Id,
            Team = team,
            Points = 0,
            MatchesPlayed = 0,
            Wins = 0,
            Draws = 0,
            Losses = 0,
            GoalsFor = 0,
            GoalsAgainst = 0,
            GoalDifference = 0
        }).ToList();

        return new Group
        {
            Id = 1,
            Name = "A",
            Teams = groupTeams,
            Matches = new List<GroupMatch>()
        };
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}