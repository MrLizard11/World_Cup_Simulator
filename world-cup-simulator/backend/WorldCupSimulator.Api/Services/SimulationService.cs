using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services;

public class SimulationService : ISimulationService
{
    private readonly Random _random;
    
    // Default Elo ratings for teams (synced with frontend data)
    private readonly Dictionary<string, int> _defaultEloRatings = new()
    {
        // Based on recent FIFA rankings and international performance
        ["Brazil"] = 2001,
        ["Argentina"] = 2131,
        ["France"] = 2055,
        ["Germany"] = 1913,
        ["Spain"] = 2156,
        ["England"] = 1984,
        ["Italy"] = 1881,
        ["Netherlands"] = 1975,
        ["Portugal"] = 2030,
        ["Belgium"] = 1846,
        ["Croatia"] = 1926,
        ["Uruguay"] = 1901,
        ["Mexico"] = 1860,
        ["Colombia"] = 1951,
        ["Chile"] = 1688,
        ["Peru"] = 1743,
        ["Ecuador"] = 1905,
        ["Venezuela"] = 1745,
        ["United States"] = 1696,
        ["Canada"] = 1768,
        ["Japan"] = 1881,
        ["South Korea"] = 1752,
        ["Australia"] = 1773,
        ["Saudi Arabia"] = 1567,
        ["Iran"] = 1799,
        ["Qatar"] = 1517,
        ["Morocco"] = 1812,
        ["Tunisia"] = 1614,
        ["Egypt"] = 1667,
        ["Ghana"] = 1478,
        ["Nigeria"] = 1578,
        ["Senegal"] = 1784
    };

    public SimulationService()
    {
        _random = new Random();
    }

    public (int scoreA, int scoreB) SimulateMatch(Team teamA, Team teamB, SimulationMode mode = SimulationMode.EloRealistic, SituationalFactors? situationalFactors = null)
    {
        return mode switch
        {
            SimulationMode.Random => GeneratePureRandomScores(),
            SimulationMode.EloSimple => SimulateSimpleEloMatch(teamA, teamB),
            SimulationMode.EloRealistic => SimulateRealisticMatch(teamA, teamB),
            SimulationMode.EloAdvanced => SimulateAdvancedMatch(teamA, teamB, situationalFactors),
            _ => SimulateRealisticMatch(teamA, teamB)
        };
    }

    public double CalculateExpectedScore(int eloA, int eloB)
    {
        // Standard Elo expected score formula
        return 1.0 / (1.0 + Math.Pow(10.0, (eloB - eloA) / 400.0));
    }

    public (Team teamA, Team teamB) UpdateEloRatings(Team teamA, Team teamB, int scoreA, int scoreB, int kFactor = 32)
    {
        var expectedScoreA = CalculateExpectedScore(teamA.Elo, teamB.Elo);
        var expectedScoreB = 1.0 - expectedScoreA;

        // Calculate actual score (1 for win, 0.5 for draw, 0 for loss)
        double actualScoreA, actualScoreB;
        if (scoreA > scoreB)
        {
            actualScoreA = 1.0;
            actualScoreB = 0.0;
        }
        else if (scoreB > scoreA)
        {
            actualScoreA = 0.0;
            actualScoreB = 1.0;
        }
        else
        {
            actualScoreA = 0.5;
            actualScoreB = 0.5;
        }

        // Update Elo ratings
        var newEloA = (int)Math.Round(teamA.Elo + kFactor * (actualScoreA - expectedScoreA));
        var newEloB = (int)Math.Round(teamB.Elo + kFactor * (actualScoreB - expectedScoreB));

        // Create team objects
        var updatedTeamA = new Team
        {
            Id = teamA.Id,
            Name = teamA.Name,
            Country = teamA.Country,
            CountryCode = teamA.CountryCode,
            Elo = newEloA
        };

        var updatedTeamB = new Team
        {
            Id = teamB.Id,
            Name = teamB.Name,
            Country = teamB.Country,
            CountryCode = teamB.CountryCode,
            Elo = newEloB
        };

        return (updatedTeamA, updatedTeamB);
    }

    private (int scoreA, int scoreB) GeneratePureRandomScores()
    {
        // Pure random scoring (0-4 goals each team)
        return (_random.Next(0, 5), _random.Next(0, 5));
    }

    private (int scoreA, int scoreB) SimulateSimpleEloMatch(Team teamA, Team teamB)
    {
        var eloA = GetTeamElo(teamA);
        var eloB = GetTeamElo(teamB);

        // Calculate strength difference
        var eloDiff = eloA - eloB;
        var strengthFactorA = CalculateStrengthFactor(eloDiff);
        var strengthFactorB = CalculateStrengthFactor(-eloDiff);

        // Generate base random scores (0-4) then apply strength factors
        var baseScoreA = _random.Next(0, 5);
        var baseScoreB = _random.Next(0, 5);

        // Apply strength multipliers
        var adjustedScoreA = (int)Math.Floor(baseScoreA * strengthFactorA);
        var adjustedScoreB = (int)Math.Floor(baseScoreB * strengthFactorB);

        return (
            Math.Max(0, Math.Min(adjustedScoreA, 6)), // Keep reasonable bounds
            Math.Max(0, Math.Min(adjustedScoreB, 6))
        );
    }

    private (int scoreA, int scoreB) SimulateRealisticMatch(Team teamA, Team teamB)
    {
        var eloA = GetTeamElo(teamA);
        var eloB = GetTeamElo(teamB);

        // Calculate expected score (win probability) using Elo formula
        var expectedScoreA = CalculateExpectedScore(eloA, eloB);
        var expectedScoreB = 1.0 - expectedScoreA;

        // Convert win probability to goal expectation
        // Higher Elo teams get higher goal expectations
        const double baseGoalExpectation = 1.4; // Average goals per team per match in World Cup
        const double maxGoalBonus = 0.8; // Maximum additional goals from strength difference

        var goalExpectationA = baseGoalExpectation + (expectedScoreA - 0.5) * maxGoalBonus;
        var goalExpectationB = baseGoalExpectation + (expectedScoreB - 0.5) * maxGoalBonus;

        // Generate goals using Poisson distribution
        var goalsA = PoissonRandom(Math.Max(0.1, goalExpectationA));
        var goalsB = PoissonRandom(Math.Max(0.1, goalExpectationB));

        return (
            Math.Min(goalsA, 8), // Cap at 8 goals for realism
            Math.Min(goalsB, 8)
        );
    }

    private (int scoreA, int scoreB) SimulateAdvancedMatch(Team teamA, Team teamB, SituationalFactors? factors)
    {
        var eloA = GetTeamElo(teamA);
        var eloB = GetTeamElo(teamB);

        // Apply situational factors
        factors ??= new SituationalFactors();
        var adjustedEloA = eloA * factors.TeamAForm;
        var adjustedEloB = eloB * factors.TeamBForm;

        var expectedScoreA = CalculateExpectedScore((int)adjustedEloA, (int)adjustedEloB);
        var expectedScoreB = 1.0 - expectedScoreA;

        // Adjust for match importance (finals vs group stage)
        var adjustedGoalExpectationA = (1.3 * expectedScoreA + 0.3) * factors.RoundImportance;
        var adjustedGoalExpectationB = (1.3 * expectedScoreB + 0.3) * factors.RoundImportance;

        // Add some randomness (upsets happen!)
        const double randomFactor = 0.15; // 15% randomness
        var finalExpectationA = adjustedGoalExpectationA * (1 - randomFactor) + 
                               _random.NextDouble() * 2.5 * randomFactor;
        var finalExpectationB = adjustedGoalExpectationB * (1 - randomFactor) + 
                               _random.NextDouble() * 2.5 * randomFactor;

        // Generate goals using Poisson distribution
        var goalsA = PoissonRandom(Math.Max(0.1, finalExpectationA));
        var goalsB = PoissonRandom(Math.Max(0.1, finalExpectationB));

        return (
            Math.Min(goalsA, 8), // Cap at 8 goals for realism
            Math.Min(goalsB, 8)
        );
    }

    private int GetTeamElo(Team team)
    {
        // Use team's current Elo or fall back to default/calculated value
        if (team.Elo > 0)
            return team.Elo;

        // Try to find default Elo rating
        if (_defaultEloRatings.TryGetValue(team.Name, out var defaultElo))
            return defaultElo;

        // Fallback to a reasonable default
        return 1600;
    }

    private double CalculateStrengthFactor(int eloDifference)
    {
        // Convert Elo difference to a multiplier between 0.5 and 2.0
        var normalized = eloDifference / 400.0; // Normalize Elo difference
        return Math.Max(0.5, Math.Min(2.0, 1.0 + normalized * 0.5));
    }

    private int PoissonRandom(double lambda)
    {
        // Simplified Poisson distribution using Knuth's algorithm
        if (lambda <= 0) return 0;
        
        var L = Math.Exp(-lambda);
        var k = 0;
        var p = 1.0;

        do
        {
            k++;
            p *= _random.NextDouble();
        } while (p > L);

        return k - 1;
    }
}
