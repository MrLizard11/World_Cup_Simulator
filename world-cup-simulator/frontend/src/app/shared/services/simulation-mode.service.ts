import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Team } from '../../models/team.model';
import { ServerMatchSimulationService, SimulationMode as ServerSimulationMode } from './server-match-simulation.service';

export enum SimulationMode {
  RANDOM = 'Random',
  ELO_SIMPLE = 'EloSimple',
  ELO_REALISTIC = 'EloRealistic',
  ELO_ADVANCED = 'EloAdvanced'
}

@Injectable({
  providedIn: 'root'
})
export class SimulationModeService {
  private currentMode: SimulationMode = SimulationMode.ELO_REALISTIC;

  constructor(private serverSimulation: ServerMatchSimulationService) { }

  setSimulationMode(mode: SimulationMode): void {
    this.currentMode = mode;
  }

  getCurrentMode(): SimulationMode {
    return this.currentMode;
  }

  /**
   * Simulate a match using the currently selected mode
   */
  simulateMatch(teamA: Team, teamB: Team, situationalFactors?: any): Observable<{ scoreA: number, scoreB: number }> {
    const serverMode = this.mapToServerMode(this.currentMode);
    return this.serverSimulation.simulateMatchWithMode(teamA, teamB, serverMode);
  }

  /**
   * Map local simulation modes to server modes
   */
  private mapToServerMode(mode: SimulationMode): ServerSimulationMode {
    switch (mode) {
      case SimulationMode.RANDOM:
        return ServerSimulationMode.RANDOM;
      case SimulationMode.ELO_SIMPLE:
      case SimulationMode.ELO_REALISTIC:
      case SimulationMode.ELO_ADVANCED:
        return ServerSimulationMode.ELO_REALISTIC;
      default:
        return ServerSimulationMode.ELO_REALISTIC;
    }
  }

  /**
   * Get description of current simulation mode
   */
  getCurrentModeDescription(): string {
    switch (this.currentMode) {
      case SimulationMode.RANDOM:
        return 'Pure random scoring - completely unpredictable results';
      
      case SimulationMode.ELO_SIMPLE:
        return 'Basic Elo-based simulation with strength factors';
      
      case SimulationMode.ELO_REALISTIC:
        return 'Advanced Elo simulation with win probability and statistical models';
      
      case SimulationMode.ELO_ADVANCED:
        return 'Most sophisticated simulation with team form and situational factors';
      
      default:
        return 'Advanced Elo simulation with win probability and statistical models';
    }
  }

  /**
   * Get all available simulation modes with descriptions
   */
  getAvailableModes(): { mode: SimulationMode, name: string, description: string }[] {
    return [
      {
        mode: SimulationMode.RANDOM,
        name: 'Random Mode',
        description: 'Pure random scoring - completely unpredictable results'
      },
      {
        mode: SimulationMode.ELO_SIMPLE,
        name: 'Elo Simple',
        description: 'Basic Elo-based simulation with strength factors'
      },
      {
        mode: SimulationMode.ELO_REALISTIC,
        name: 'Elo Realistic',
        description: 'Advanced Elo simulation with win probability and statistical models'
      },
      {
        mode: SimulationMode.ELO_ADVANCED,
        name: 'Elo Advanced',
        description: 'Most sophisticated simulation with team form and situational factors'
      }
    ];
  }

  /**
   * Generate pure random scores (ignores team parameters for chaos mode)
   */
  private generatePureRandomScores(): { scoreA: number, scoreB: number } {
    return {
      scoreA: Math.floor(Math.random() * 5),
      scoreB: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Get expected statistics for a match without simulating it
   */
  getMatchPreview(teamA: Team, teamB: Team): Observable<{
    winProbabilityA: number;
    winProbabilityB: number;
    drawProbability: number;
    expectedGoalsA: number;
    expectedGoalsB: number;
    eloDifference: number;
  }> {
    // Use server simulation to get statistics
    return this.serverSimulation.simulateRealisticMatch(teamA, teamB).pipe(
      switchMap(result => {
        // For now, provide basic statistics - the server could provide more detailed stats in the future
        const eloDiff = teamA.elo - teamB.elo;
        const winProbA = 1 / (1 + Math.pow(10, -eloDiff / 400));
        
        return [{
          winProbabilityA: winProbA,
          winProbabilityB: 1 - winProbA,
          drawProbability: 0.25, // Rough estimate
          expectedGoalsA: result.scoreA,
          expectedGoalsB: result.scoreB,
          eloDifference: eloDiff
        }];
      })
    );
  }
}
