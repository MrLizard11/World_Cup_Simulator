import { Injectable } from '@angular/core';
import { Team } from '../../models/team.model';
import { MatchSimulationService } from './match-simulation.service';

@Injectable({
  providedIn: 'root'
})
export class EloUpdateService {
  
  constructor(private matchSimulation: MatchSimulationService) { }

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
    
    // Calculate match statistics including Elo changes
    const matchStats = this.matchSimulation.calculateMatchStats(teamA, teamB, scoreA, scoreB);
    
    // Create updated team objects with new Elo ratings
    const updatedTeamA: Team = {
      ...teamA,
      elo: Math.round(teamA.elo + matchStats.eloChangeA) // Round to nearest integer
    };
    
    const updatedTeamB: Team = {
      ...teamB,
      elo: Math.round(teamB.elo + matchStats.eloChangeB) // Round to nearest integer
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
    
    const matchStats = this.matchSimulation.calculateMatchStats(teamA, teamB, scoreA, scoreB);
    
    return {
      eloChangeA: matchStats.eloChangeA,
      eloChangeB: matchStats.eloChangeB,
      newEloA: Math.round(teamA.elo + matchStats.eloChangeA),
      newEloB: Math.round(teamB.elo + matchStats.eloChangeB)
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
    
    const matchStats = this.matchSimulation.calculateMatchStats(teamA, teamB, scoreA, scoreB);
    
    let winner: string;
    let loser: string;
    let winnerChange: number;
    let loserChange: number;
    
    if (scoreA > scoreB) {
      winner = teamA.name;
      loser = teamB.name;
      winnerChange = matchStats.eloChangeA;
      loserChange = matchStats.eloChangeB;
    } else if (scoreB > scoreA) {
      winner = teamB.name;
      loser = teamA.name;
      winnerChange = matchStats.eloChangeB;
      loserChange = matchStats.eloChangeA;
    } else {
      // Draw - both teams get smaller changes
      const avgChange = Math.abs((matchStats.eloChangeA + matchStats.eloChangeB) / 2);
      return {
        winner: 'Draw',
        loser: 'Draw',
        isUpset: false,
        impact: avgChange > 15 ? 'moderate' : 'minor',
        description: `Draw results in minimal Elo changes for both teams`
      };
    }
    
    const isUpset = matchStats.upsetFactor > 0.1;
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
