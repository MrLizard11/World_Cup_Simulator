import { Injectable } from '@angular/core';
import { Team } from '../../models/team.model';
import { ELO_RATINGS } from '../../team-selection/data/elo-ratings.data';

@Injectable({
  providedIn: 'root'
})
export class MatchSimulationService {

  constructor() { }

  /**
   * Simulate a match using Elo ratings and Poisson distribution
   * @param teamA First team
   * @param teamB Second team
   * @returns Match result with realistic scores
   */
  simulateRealisticMatch(teamA: Team, teamB: Team): { scoreA: number, scoreB: number } {
    const eloA = ELO_RATINGS[teamA.name] || 1600; // Default Elo if not found
    const eloB = ELO_RATINGS[teamB.name] || 1600;

    // Calculate expected score (win probability) using Elo formula
    const expectedScoreA = this.calculateExpectedScore(eloA, eloB);
    const expectedScoreB = 1 - expectedScoreA;

    // Convert win probability to goal expectation
    // Higher Elo teams get higher goal expectations
    const baseGoalExpectation = 1.4; // Average goals per team per match in World Cup
    const maxGoalBonus = 0.8; // Maximum additional goals from strength difference

    const goalExpectationA = baseGoalExpectation + (expectedScoreA - 0.5) * maxGoalBonus;
    const goalExpectationB = baseGoalExpectation + (expectedScoreB - 0.5) * maxGoalBonus;

    // Generate goals using Poisson distribution
    const goalsA = this.poissonRandom(Math.max(0.1, goalExpectationA));
    const goalsB = this.poissonRandom(Math.max(0.1, goalExpectationB));

    return {
      scoreA: Math.min(goalsA, 8), // Cap at 8 goals for realism
      scoreB: Math.min(goalsB, 8)
    };
  }

  /**
   * Alternative: Simple Elo-weighted random approach
   * Faster computation, still more realistic than pure random
   */
  simulateSimpleEloMatch(teamA: Team, teamB: Team): { scoreA: number, scoreB: number } {
    const eloA = ELO_RATINGS[teamA.name] || 1600;
    const eloB = ELO_RATINGS[teamB.name] || 1600;

    // Calculate strength difference
    const eloDiff = eloA - eloB;
    const strengthFactorA = this.calculateStrengthFactor(eloDiff);
    const strengthFactorB = this.calculateStrengthFactor(-eloDiff);

    // Generate base random scores (0-4) then apply strength factors
    const baseScoreA = Math.floor(Math.random() * 5);
    const baseScoreB = Math.floor(Math.random() * 5);

    // Apply strength multipliers
    const adjustedScoreA = Math.floor(baseScoreA * strengthFactorA);
    const adjustedScoreB = Math.floor(baseScoreB * strengthFactorB);

    return {
      scoreA: Math.max(0, Math.min(adjustedScoreA, 6)), // Keep reasonable bounds
      scoreB: Math.max(0, Math.min(adjustedScoreB, 6))
    };
  }

  /**
   * Advanced: Situational factors simulation
   * Includes form, fatigue, and randomness factors
   */
  simulateAdvancedMatch(teamA: Team, teamB: Team, situationalFactors?: {
    teamAForm?: number; // 0.8 to 1.2 multiplier
    teamBForm?: number;
    isNeutralVenue?: boolean;
    roundImportance?: number; // Finals = 1.1, Groups = 1.0
  }): { scoreA: number, scoreB: number } {
    const eloA = ELO_RATINGS[teamA.name] || 1600;
    const eloB = ELO_RATINGS[teamB.name] || 1600;

    // Apply situational factors
    const factors = situationalFactors || {};
    const adjustedEloA = eloA * (factors.teamAForm || 1.0);
    const adjustedEloB = eloB * (factors.teamBForm || 1.0);

    const expectedScoreA = this.calculateExpectedScore(adjustedEloA, adjustedEloB);
    const expectedScoreB = 1 - expectedScoreA;

    // Adjust for match importance (finals vs group stage)
    const importance = factors.roundImportance || 1.0;
    const adjustedGoalExpectationA = (1.3 * expectedScoreA + 0.3) * importance;
    const adjustedGoalExpectationB = (1.3 * expectedScoreB + 0.3) * importance;

    // Add some randomness (upsets happen!)
    const randomFactor = 0.15; // 15% randomness
    const finalExpectationA = adjustedGoalExpectationA * (1 - randomFactor) + 
                              Math.random() * 2.5 * randomFactor;
    const finalExpectationB = adjustedGoalExpectationB * (1 - randomFactor) + 
                              Math.random() * 2.5 * randomFactor;

    const goalsA = this.poissonRandom(Math.max(0.1, finalExpectationA));
    const goalsB = this.poissonRandom(Math.max(0.1, finalExpectationB));

    return {
      scoreA: Math.min(goalsA, 7),
      scoreB: Math.min(goalsB, 7)
    };
  }

  /**
   * Calculate expected score using Elo rating formula
   * Standard chess Elo formula adapted for football
   */
  private calculateExpectedScore(eloA: number, eloB: number): number {
    const eloDifference = eloA - eloB;
    return 1 / (1 + Math.pow(10, -eloDifference / 400));
  }

  /**
   * Calculate strength factor based on Elo difference
   * Used for simple simulation method
   */
  private calculateStrengthFactor(eloDifference: number): number {
    // Map Elo difference to strength multiplier
    // 200 point difference = ~25% strength advantage
    const maxAdvantage = 0.6; // Maximum 60% advantage
    const scalingFactor = 300; // Elo points for maximum advantage

    const advantage = Math.tanh(eloDifference / scalingFactor) * maxAdvantage;
    return 1.0 + advantage;
  }

  /**
   * Generate Poisson-distributed random number
   * More realistic than uniform distribution for goal scoring
   */
  private poissonRandom(lambda: number): number {
    if (lambda <= 0) return 0;
    
    // For small lambda, use Knuth's algorithm
    if (lambda < 30) {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1.0;

      do {
        k++;
        p *= Math.random();
      } while (p > L);

      return k - 1;
    }

    // For larger lambda, use normal approximation
    const normal = this.normalRandom(lambda, Math.sqrt(lambda));
    return Math.max(0, Math.round(normal));
  }

  /**
   * Generate normally distributed random number using Box-Muller transform
   */
  private normalRandom(mean: number, stdDev: number): number {
    let u1 = 0, u2 = 0;
    // Ensure we don't get 0
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();

    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Get match statistics including Elo change
   * Call this after simulating a match to get additional insights
   */
  calculateMatchStats(teamA: Team, teamB: Team, scoreA: number, scoreB: number): {
    winProbabilityA: number;
    winProbabilityB: number;
    drawProbability: number;
    eloChangeA: number;
    eloChangeB: number;
    upsetFactor: number;
  } {
    const eloA = ELO_RATINGS[teamA.name] || 1600;
    const eloB = ELO_RATINGS[teamB.name] || 1600;

    const expectedScoreA = this.calculateExpectedScore(eloA, eloB);
    
    // Calculate actual result for Elo
    let actualScoreA: number;
    if (scoreA > scoreB) actualScoreA = 1; // Win
    else if (scoreA < scoreB) actualScoreA = 0; // Loss
    else actualScoreA = 0.5; // Draw

    // Calculate Elo changes
    const kFactor = 20; // Standard K-factor for international matches
    const eloChangeA = kFactor * (actualScoreA - expectedScoreA);
    const eloChangeB = -eloChangeA;

    // Calculate upset factor
    const favoriteExpected = Math.max(expectedScoreA, 1 - expectedScoreA);
    const upsetFactor = actualScoreA === 1 && expectedScoreA < 0.4 ? 
                       (0.4 - expectedScoreA) * 2.5 : 0;

    return {
      winProbabilityA: expectedScoreA,
      winProbabilityB: 1 - expectedScoreA,
      drawProbability: 0.26, // Rough estimate for football draws
      eloChangeA,
      eloChangeB,
      upsetFactor
    };
  }
}
