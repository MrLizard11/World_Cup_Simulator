using WorldCupSimulator.Api.Models;

namespace WorldCupSimulator.Api.Services;

public enum SimulationMode
{
    Random,
    EloSimple,
    EloRealistic,
    EloAdvanced
}

public interface ISimulationService
{
    /// <summary>
    /// Simulate a match between two teams using the specified simulation mode
    /// </summary>
    /// <param name="teamA">First team</param>
    /// <param name="teamB">Second team</param>
    /// <param name="mode">Simulation mode to use</param>
    /// <param name="situationalFactors">Optional factors for advanced simulation</param>
    /// <returns>Match result with scores</returns>
    (int scoreA, int scoreB) SimulateMatch(Team teamA, Team teamB, SimulationMode mode = SimulationMode.EloRealistic, SituationalFactors? situationalFactors = null);

    /// <summary>
    /// Calculate expected score (win probability) using Elo formula
    /// </summary>
    /// <param name="eloA">Team A's Elo rating</param>
    /// <param name="eloB">Team B's Elo rating</param>
    /// <returns>Expected score for team A (0.0 to 1.0)</returns>
    double CalculateExpectedScore(int eloA, int eloB);

    /// <summary>
    /// Update team Elo ratings after a match
    /// </summary>
    /// <param name="teamA">Team A</param>
    /// <param name="teamB">Team B</param>
    /// <param name="scoreA">Team A's score</param>
    /// <param name="scoreB">Team B's score</param>
    /// <param name="kFactor">K-factor for Elo calculation (default: 32)</param>
    /// <returns>Updated teams with new Elo ratings</returns>
    (Team teamA, Team teamB) UpdateEloRatings(Team teamA, Team teamB, int scoreA, int scoreB, int kFactor = 32);
}

public class SituationalFactors
{
    public double TeamAForm { get; set; } = 1.0; // 0.8 to 1.2 multiplier
    public double TeamBForm { get; set; } = 1.0;
    public bool IsNeutralVenue { get; set; } = true;
    public double RoundImportance { get; set; } = 1.0; // Finals = 1.1, Groups = 1.0
}
