import { Injectable } from '@angular/core';
import { Team } from '../../models/team.model';
import { MatchSimulationService } from './match-simulation.service';

export enum SimulationMode {
  RANDOM = 'random',
  ELO_SIMPLE = 'elo_simple', 
  ELO_REALISTIC = 'elo_realistic',
  ELO_ADVANCED = 'elo_advanced'
}

@Injectable({
  providedIn: 'root'
})
export class SimulationModeService {
  private currentMode: SimulationMode = SimulationMode.ELO_REALISTIC;

  constructor(private matchSimulation: MatchSimulationService) { }

  setSimulationMode(mode: SimulationMode): void {
    this.currentMode = mode;
  }

  getCurrentMode(): SimulationMode {
    return this.currentMode;
  }

  /**
   * Simulate a match using the currently selected mode
   */
  simulateMatch(teamA: Team, teamB: Team, situationalFactors?: any): { scoreA: number, scoreB: number } {
    switch (this.currentMode) {
      case SimulationMode.RANDOM:
        return this.simulateRandomMatch();
      
      case SimulationMode.ELO_SIMPLE:
        return this.matchSimulation.simulateSimpleEloMatch(teamA, teamB);
      
      case SimulationMode.ELO_REALISTIC:
        return this.matchSimulation.simulateRealisticMatch(teamA, teamB);
      
      case SimulationMode.ELO_ADVANCED:
        return this.matchSimulation.simulateAdvancedMatch(teamA, teamB, situationalFactors);
      
      default:
        return this.matchSimulation.simulateRealisticMatch(teamA, teamB);
    }
  }

  /**
   * Get description of current simulation mode
   */
  getCurrentModeDescription(): string {
    switch (this.currentMode) {
      case SimulationMode.RANDOM:
        return 'Pure random scoring (0-4 goals each team)';
      
      case SimulationMode.ELO_SIMPLE:
        return 'Elo-weighted random with strength factors';
      
      case SimulationMode.ELO_REALISTIC:
        return 'Elo-based win probability with Poisson distribution';
      
      case SimulationMode.ELO_ADVANCED:
        return 'Advanced simulation with form, importance, and situational factors';
      
      default:
        return 'Unknown mode';
    }
  }

  /**
   * Get all available simulation modes with descriptions
   */
  getAvailableModes(): { mode: SimulationMode, name: string, description: string }[] {
    return [
      {
        mode: SimulationMode.RANDOM,
        name: 'Random',
        description: 'Pure random scoring - completely unpredictable results'
      },
      {
        mode: SimulationMode.ELO_SIMPLE,
        name: 'Elo Simple',
        description: 'Elo ratings affect goal scoring with strength multipliers'
      },
      {
        mode: SimulationMode.ELO_REALISTIC,
        name: 'Elo Realistic',
        description: 'Realistic simulation using Elo win probability and Poisson distribution'
      },
      {
        mode: SimulationMode.ELO_ADVANCED,
        name: 'Elo Advanced',
        description: 'Most realistic - includes team form, match importance, and situational factors'
      }
    ];
  }

  /**
   * Legacy random simulation for backwards compatibility
   */
  private simulateRandomMatch(): { scoreA: number, scoreB: number } {
    return {
      scoreA: Math.floor(Math.random() * 5),
      scoreB: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Get expected statistics for a match without simulating it
   */
  getMatchPreview(teamA: Team, teamB: Team): {
    winProbabilityA: number;
    winProbabilityB: number;
    drawProbability: number;
    expectedGoalsA: number;
    expectedGoalsB: number;
    eloDifference: number;
  } {
    // Simulate once to get statistics
    const result = this.matchSimulation.simulateRealisticMatch(teamA, teamB);
    const stats = this.matchSimulation.calculateMatchStats(teamA, teamB, result.scoreA, result.scoreB);
    
    return {
      winProbabilityA: stats.winProbabilityA,
      winProbabilityB: stats.winProbabilityB,
      drawProbability: stats.drawProbability,
      expectedGoalsA: result.scoreA, // This would need averaging over multiple simulations for true expected value
      expectedGoalsB: result.scoreB,
      eloDifference: stats.eloChangeA
    };
  }
}
