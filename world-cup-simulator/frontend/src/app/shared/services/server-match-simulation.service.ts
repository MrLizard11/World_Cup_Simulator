import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Team } from '../../models/team.model';
import { TournamentApiService } from './tournament-api.service';

export enum SimulationMode {
  RANDOM = 'Random',
  ELO_REALISTIC = 'EloRealistic', 
  CHAOS = 'Chaos',
  DEFENSIVE = 'Defensive'
}

@Injectable({
  providedIn: 'root'
})
export class ServerMatchSimulationService {

  constructor(private tournamentApi: TournamentApiService) { }

  /**
   * Simulate a match using server-side algorithms
   */
  simulateRealisticMatch(teamA: Team, teamB: Team): Observable<{ scoreA: number, scoreB: number }> {
    return this.tournamentApi.simulateMatch(teamA, teamB, this.mapToApiMode(SimulationMode.ELO_REALISTIC))
      .pipe(
        map(response => ({
          scoreA: response.scoreA,
          scoreB: response.scoreB
        })),
        catchError(error => {
          // Fallback to simple random if server fails
          console.error('Server simulation failed');
          return of({
            scoreA: Math.floor(Math.random() * 5),
            scoreB: Math.floor(Math.random() * 5)
          });
        })
      );
  }

  /**
   * Simulate match with specific mode
   */
  simulateMatchWithMode(teamA: Team, teamB: Team, mode: SimulationMode): Observable<{ scoreA: number, scoreB: number }> {
    return this.tournamentApi.simulateMatch(teamA, teamB, this.mapToApiMode(mode))
      .pipe(
        map(response => ({
          scoreA: response.scoreA,
          scoreB: response.scoreB
        })),
        catchError(error => {
          console.error('Server simulation failed');
          return of({
            scoreA: Math.floor(Math.random() * 5),
            scoreB: Math.floor(Math.random() * 5)
          });
        })
      );
  }

  /**
   * Simulate multiple matches at once
   */
  simulateBulkMatches(matches: {teamA: Team, teamB: Team}[], mode: SimulationMode = SimulationMode.ELO_REALISTIC): Observable<{scoreA: number, scoreB: number}[]> {
    const matchRequests = matches.map(match => ({
      teamA: match.teamA,
      teamB: match.teamB,
      situationalFactors: null
    }));

    return this.tournamentApi.simulateBulkMatches(matchRequests, this.mapToApiMode(mode))
      .pipe(
        map(responses => responses.map(response => ({
          scoreA: response.scoreA,
          scoreB: response.scoreB
        }))),
        catchError(error => {
          console.error('Bulk simulation failed');
          // Fallback to individual random results
          return of(matches.map(() => ({
            scoreA: Math.floor(Math.random() * 5),
            scoreB: Math.floor(Math.random() * 5)
          })));
        })
      );
  }

  /**
   * Get available simulation modes
   */
  getAvailableModes(): {mode: SimulationMode, name: string, description: string}[] {
    return [
      {
        mode: SimulationMode.ELO_REALISTIC,
        name: 'Realistic (Elo)',
        description: 'Uses team strength ratings and statistical models for realistic results'
      },
      {
        mode: SimulationMode.RANDOM,
        name: 'Random Mode',
        description: 'Completely random results - anything can happen!'
      },
      {
        mode: SimulationMode.CHAOS,
        name: 'Chaos Mode', 
        description: 'High-scoring, unpredictable matches with lots of goals'
      },
      {
        mode: SimulationMode.DEFENSIVE,
        name: 'Defensive Mode',
        description: 'Low-scoring, tactical matches with fewer goals'
      }
    ];
  }

  /**
   * Map local SimulationMode to the API's expected mode string.
   */
  private mapToApiMode(mode: SimulationMode): 'Random' | 'EloSimple' | 'EloRealistic' | 'EloAdvanced' {
    switch (mode) {
      case SimulationMode.RANDOM:
        return 'Random';
      case SimulationMode.ELO_REALISTIC:
        return 'EloRealistic';
      case SimulationMode.CHAOS:
        // chaos maps to Random for the server
        return 'Random';
      case SimulationMode.DEFENSIVE:
        // defensive maps to EloSimple (safer conservative simulation)
        return 'EloSimple';
      default:
        return 'EloRealistic';
    }
  }
}