import { Injectable } from '@angular/core';
import { Team } from '../../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class EloUpdateService {
  
  constructor() { }

  /**
   * Update team Elo ratings after a match
   * @param teamA First team
   * @param teamB Second team
   * @param scoreA Team A's score
   * @param scoreB Team B's score
   * @returns Updated teams with new Elo ratings
   */
  updateTeamElosAfterMatch(
    teamA: Team, 
    teamB: Team, 
    scoreA: number, 
    scoreB: number
  ): { teamA: Team; teamB: Team } {
    
    // Calculate Elo changes using standard algorithm
    const K = 32; // K-factor for World Cup matches
    const eloDiff = teamA.elo - teamB.elo;
    const expectedA = 1 / (1 + Math.pow(10, -eloDiff / 400));
    const expectedB = 1 - expectedA;
    
    // Determine actual result
    let actualA: number;
    let actualB: number;
    
    if (scoreA > scoreB) {
      actualA = 1;
      actualB = 0;
    } else if (scoreB > scoreA) {
      actualA = 0;
      actualB = 1;
    } else {
      actualA = 0.5;
      actualB = 0.5;
    }
    
    // Calculate Elo changes
    const eloChangeA = K * (actualA - expectedA);
    const eloChangeB = K * (actualB - expectedB);
    
    // Create updated team objects with new Elo ratings
    const updatedTeamA: Team = {
      ...teamA,
      elo: Math.round(teamA.elo + eloChangeA) // Round to nearest integer
    };
    
    const updatedTeamB: Team = {
      ...teamB,
      elo: Math.round(teamB.elo + eloChangeB) // Round to nearest integer
    };

    return {
      teamA: updatedTeamA,
      teamB: updatedTeamB
    };
  }

  /**
   * Calculate potential Elo changes without applying them
   * Useful for showing users what would happen
   */
  previewEloChanges(
    teamA: Team, 
    teamB: Team, 
    scoreA: number, 
    scoreB: number
  ): { eloChangeA: number; eloChangeB: number; newEloA: number; newEloB: number } {
    
    // Calculate Elo changes using standard algorithm
    const K = 32; // K-factor for World Cup matches
    const eloDiff = teamA.elo - teamB.elo;
    const expectedA = 1 / (1 + Math.pow(10, -eloDiff / 400));
    const expectedB = 1 - expectedA;
    
    // Determine actual result
    let actualA: number;
    let actualB: number;
    
    if (scoreA > scoreB) {
      actualA = 1;
      actualB = 0;
    } else if (scoreB > scoreA) {
      actualA = 0;
      actualB = 1;
    } else {
      actualA = 0.5;
      actualB = 0.5;
    }
    
    // Calculate Elo changes
    const eloChangeA = K * (actualA - expectedA);
    const eloChangeB = K * (actualB - expectedB);
    
    return {
      eloChangeA: eloChangeA,
      eloChangeB: eloChangeB,
      newEloA: Math.round(teamA.elo + eloChangeA),
      newEloB: Math.round(teamB.elo + eloChangeB)
    };
  }

  /**
   * Get match impact description for UI display
   */
  getMatchImpactDescription(
    teamA: Team, 
    teamB: Team, 
    scoreA: number, 
    scoreB: number
  ): {
    winner: string;
    loser: string;
    isUpset: boolean;
    impact: 'minor' | 'moderate' | 'major';
    description: string;
  } {
    
    const eloChanges = this.previewEloChanges(teamA, teamB, scoreA, scoreB);
    
    let winner: string;
    let loser: string;
    let winnerChange: number;
    let loserChange: number;
    
    if (scoreA > scoreB) {
      winner = teamA.name;
      loser = teamB.name;
      winnerChange = eloChanges.eloChangeA;
      loserChange = eloChanges.eloChangeB;
    } else if (scoreB > scoreA) {
      winner = teamB.name;
      loser = teamA.name;
      winnerChange = eloChanges.eloChangeB;
      loserChange = eloChanges.eloChangeA;
    } else {
      // Draw - both teams get smaller changes
      const avgChange = Math.abs((eloChanges.eloChangeA + eloChanges.eloChangeB) / 2);
      return {
        winner: 'Draw',
        loser: 'Draw',
        isUpset: false,
        impact: avgChange > 15 ? 'moderate' : 'minor',
        description: `Draw results in minimal Elo changes for both teams`
      };
    }
    
    const eloDiff = teamA.elo - teamB.elo;
    const expectedA = 1 / (1 + Math.pow(10, -eloDiff / 400));
    
    // Determine if this was an upset based on expected probability
    const isUpset = (scoreA > scoreB && expectedA < 0.3) || (scoreB > scoreA && expectedA > 0.7);
    const changeSize = Math.abs(winnerChange);
    
    let impact: 'minor' | 'moderate' | 'major';
    if (changeSize > 25) impact = 'major';
    else if (changeSize > 15) impact = 'moderate';
    else impact = 'minor';
    
    let description = '';
    if (isUpset) {
      description = `Upset victory! ${winner} gains significant Elo points.`;
    } else if (impact === 'major') {
      description = `Dominant performance brings major Elo boost for ${winner}.`;
    } else if (impact === 'moderate') {
      description = `Expected result with moderate Elo adjustment.`;
    } else {
      description = `Close match results in minor Elo changes.`;
    }
    
    return {
      winner,
      loser,
      isUpset,
      impact,
      description
    };
  }

  /**
   * Apply tournament-wide Elo decay (optional feature)
   * Could be used between tournaments to bring extreme ratings back toward center
   */
  // applyEloDecay(teams: Team[], decayFactor: number = 0.02): Team[] {
  //   const centerElo = 1600; // Standard Elo center point
    
  //   return teams.map(team => ({
  //     ...team,
  //     elo: Math.round(team.elo + (centerElo - team.elo) * decayFactor)
  //   }));
  // }
}
