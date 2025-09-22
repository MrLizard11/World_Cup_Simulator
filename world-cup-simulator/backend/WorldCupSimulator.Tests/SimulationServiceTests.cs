using WorldCupSimulator.Api.Models;
using WorldCupSimulator.Api.Services;
using Xunit;

namespace WorldCupSimulator.Tests;

public class SimulationServiceTests
{
    private readonly SimulationService _simulationService;

    public SimulationServiceTests()
    {
        _simulationService = new SimulationService();
    }

    [Fact]
    public void CalculateExpectedScore_WithEqualElo_ReturnsHalf()
    {
        // Arrange
        var eloA = 1600;
        var eloB = 1600;

        // Act
        var result = _simulationService.CalculateExpectedScore(eloA, eloB);

        // Assert
        Assert.Equal(0.5, result, 3); // Equal teams should have 50% chance
    }

    [Fact]
    public void CalculateExpectedScore_WithHigherEloA_ReturnsGreaterThanHalf()
    {
        // Arrange
        var eloA = 2000; // Stronger team
        var eloB = 1600; // Weaker team

        // Act
        var result = _simulationService.CalculateExpectedScore(eloA, eloB);

        // Assert
        Assert.True(result > 0.5); // Stronger team should have >50% chance
        Assert.True(result < 1.0); // But not 100% chance
    }

    [Fact]
    public void CalculateExpectedScore_WithLowerEloA_ReturnsLessThanHalf()
    {
        // Arrange
        var eloA = 1600; // Weaker team
        var eloB = 2000; // Stronger team

        // Act
        var result = _simulationService.CalculateExpectedScore(eloA, eloB);

        // Assert
        Assert.True(result < 0.5); // Weaker team should have <50% chance
        Assert.True(result > 0.0); // But not 0% chance
    }

    [Theory]
    [InlineData(1600, 1600, 0.5)] // Equal teams
    [InlineData(2000, 1600, 0.9091)] // 400 point difference
    [InlineData(1600, 2000, 0.0909)] // Reverse
    [InlineData(2100, 1500, 0.9693)] // 600 point difference
    public void CalculateExpectedScore_WithKnownValues_ReturnsExpectedResults(int eloA, int eloB, double expected)
    {
        // Act
        var result = _simulationService.CalculateExpectedScore(eloA, eloB);

        // Assert
        Assert.Equal(expected, result, 4); // 4 decimal places precision
    }

    [Fact]
    public void UpdateEloRatings_AfterWin_UpdatesRatingsCorrectly()
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2000 };
        var teamB = new Team { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 1900 };
        var scoreA = 2; // Team A wins
        var scoreB = 1;

        // Act
        var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(teamA, teamB, scoreA, scoreB);

        // Assert
        Assert.True(updatedTeamA.Elo > teamA.Elo); // Winner gains Elo
        Assert.True(updatedTeamB.Elo < teamB.Elo); // Loser loses Elo
        Assert.Equal(teamA.Name, updatedTeamA.Name); // Other properties remains unchanged
        Assert.Equal(teamB.Name, updatedTeamB.Name);
    }

    [Fact]
    public void UpdateEloRatings_AfterDraw_UpdatesRatingsBasedOnExpectedScore()
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2000 };
        var teamB = new Team { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 1600 };
        var scoreA = 1; // Draw
        var scoreB = 1;

        // Act
        var (updatedTeamA, updatedTeamB) = _simulationService.UpdateEloRatings(teamA, teamB, scoreA, scoreB);

        // Assert
        // Higher-rated team should lose points in a draw (underperformed)
        Assert.True(updatedTeamA.Elo < teamA.Elo);
        // Lower-rated team should gain points in a draw (overperformed)
        Assert.True(updatedTeamB.Elo > teamB.Elo);
    }

    [Fact]
    public void UpdateEloRatings_WithCustomKFactor_UsesCorrectMultiplier()
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 1600 };
        var teamB = new Team { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 1600 };
        var scoreA = 1; // Team A wins
        var scoreB = 0;
        var customKFactor = 64; // Double the default

        // Act
        var (updatedA32, updatedB32) = _simulationService.UpdateEloRatings(teamA, teamB, scoreA, scoreB, 32);
        var (updatedA64, updatedB64) = _simulationService.UpdateEloRatings(teamA, teamB, scoreA, scoreB, customKFactor);

        // Assert
        var changeA32 = Math.Abs(updatedA32.Elo - teamA.Elo);
        var changeA64 = Math.Abs(updatedA64.Elo - teamA.Elo);
        
        Assert.True(changeA64 > changeA32); // Higher K-factor = bigger rating changes
        Assert.Equal(changeA64, changeA32 * 2, 1.0); // Should be approximately double
    }

    [Theory]
    [InlineData(SimulationMode.Random)]
    [InlineData(SimulationMode.EloSimple)]
    [InlineData(SimulationMode.EloRealistic)]
    [InlineData(SimulationMode.EloAdvanced)]
    public void SimulateMatch_WithAllModes_ReturnsValidScores(SimulationMode mode)
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2000 };
        var teamB = new Team { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 1900 };

        // Act
        var (scoreA, scoreB) = _simulationService.SimulateMatch(teamA, teamB, mode);

        // Assert
        Assert.True(scoreA >= 0); // Scores should be non-negative
        Assert.True(scoreB >= 0);
        Assert.True(scoreA <= 8); // Reasonable upper bound based on implementation
        Assert.True(scoreB <= 8);
    }

    [Fact]
    public void SimulateMatch_WithStrongerTeam_TendsToWinMore()
    {
        // Arrange
        var strongTeam = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 2200 };
        var weakTeam = new Team { Id = 2, Name = "Weak Team", Country = "Weak", CountryCode = "WK", Elo = 1400 };
        var strongerWins = 0;
        var simulations = 1000;

        // Act - Run many simulations to test probability
        for (int i = 0; i < simulations; i++)
        {
            var (scoreA, scoreB) = _simulationService.SimulateMatch(strongTeam, weakTeam, SimulationMode.EloRealistic);
            if (scoreA > scoreB)
                strongerWins++;
        }

        var winRate = (double)strongerWins / simulations;

        // Assert - Account for randomness in simulation
        Assert.True(winRate > 0.5, $"Win rate was {winRate:P2}, expected >50%"); // Strong team should win more than half  
        Assert.True(winRate < 0.95, $"Win rate was {winRate:P2}, expected <95%"); // But not >95% (upsets happen)
    }

    [Fact]
    public void SimulateMatch_WithRandomMode_ProducesVariedResults()
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Team A", Country = "A", CountryCode = "AA", Elo = 1600 };
        var teamB = new Team { Id = 2, Name = "Team B", Country = "B", CountryCode = "BB", Elo = 1600 };
        var results = new HashSet<(int, int)>();
        var simulations = 100;

        // Act
        for (int i = 0; i < simulations; i++)
        {
            var result = _simulationService.SimulateMatch(teamA, teamB, SimulationMode.Random);
            results.Add(result);
        }

        // Assert
        Assert.True(results.Count > 10); // Should produce different results, not always the same
    }

    [Fact]
    public void SimulateMatch_WithAdvancedMode_UsesFactors()
    {
        // Arrange
        var teamA = new Team { Id = 1, Name = "Brazil", Country = "Brazil", CountryCode = "BR", Elo = 1800 };
        var teamB = new Team { Id = 2, Name = "Argentina", Country = "Argentina", CountryCode = "AR", Elo = 1800 };
        var factors = new SituationalFactors
        {
            TeamAForm = 1.2, // Team A in better form
            TeamBForm = 0.8, // Team B in worse form
            RoundImportance = 1.1 // Important match
        };

        var teamAWins = 0;
        var simulations = 1000;

        // Act
        for (int i = 0; i < simulations; i++)
        {
            var (scoreA, scoreB) = _simulationService.SimulateMatch(teamA, teamB, SimulationMode.EloAdvanced, factors);
            if (scoreA > scoreB)
                teamAWins++;
        }

        var winRate = (double)teamAWins / simulations;

        // Assert
        Assert.True(winRate > 0.55); // Team A should win more due to better form
    }

    [Theory]
    [InlineData(0.5, 0, 2)]   // Low expected goals
    [InlineData(1.5, 0, 4)]   // Medium expected goals  
    [InlineData(3.0, 0, 6)]   // High expected goals (can still have 0 goals sometimes)
    public void PoissonDistribution_ProducesReasonableResults(double expectedAverage, int minExpected, int maxExpected)
    {
        // This tests the Poisson implementation indirectly through EloRealistic mode
        // Arrange - Use teams with different Elo ratings to influence expected goals
        var eloHigh = expectedAverage > 2.0 ? 1800 : expectedAverage > 1.0 ? 1600 : 1400;
        var eloLow = expectedAverage > 2.0 ? 1400 : expectedAverage > 1.0 ? 1600 : 1800;
        
        var teamA = new Team { Id = 1, Name = "Team A", Country = "A", CountryCode = "AA", Elo = eloHigh };
        var teamB = new Team { Id = 2, Name = "Team B", Country = "B", CountryCode = "BB", Elo = eloLow };
        var results = new List<int>();

        // Act - Run many simulations and collect goal counts
        for (int i = 0; i < 500; i++)
        {
            var (scoreA, scoreB) = _simulationService.SimulateMatch(teamA, teamB, SimulationMode.EloRealistic);
            results.Add(scoreA);
            results.Add(scoreB);
        }

        // Assert
        var minResult = results.Min();
        var maxResult = results.Max();
        var average = results.Average();

        Assert.True(minResult >= minExpected); // Minimum reasonable
        Assert.True(maxResult <= Math.Max(maxExpected, 8)); // Maximum reasonable 
        Assert.True(average >= 0.3 && average <= 4.0); // Reasonable average for football
    }
}