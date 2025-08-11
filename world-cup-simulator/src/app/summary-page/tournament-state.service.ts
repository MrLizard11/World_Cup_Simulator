import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Team } from '../models';
import { Group, GroupStandings } from '../models/group.model';
import { KnockoutMatch } from '../models/knockouts.model';

export interface TournamentState {
  // Tournament Progress
  isGroupStageComplete: boolean;
  isKnockoutStageComplete: boolean;
  isTournamentComplete: boolean;
  
  // Teams Data
  selectedTeams: Team[];
  top16Teams: Team[];
  
  // Group Stage Data
  groups: Group[];
  groupStandings: GroupStandings[];
  
  // Knockout Stage Data
  roundOf16Matches: KnockoutMatch[];
  quarterFinalMatches: KnockoutMatch[];
  semiFinalMatches: KnockoutMatch[];
  finalMatch: KnockoutMatch | null;
  
  // Tournament Results
  champion: Team | null;
  runnerUp: Team | null;
  semiFinalTeams: Team[];
  
  // Statistics
  totalMatches: number;
  totalGoals: number;
  penaltyShootouts: number;
  biggestWin: {
    match: string;
    score: string;
    difference: number;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentStateService {
  
  private initialState: TournamentState = {
    isGroupStageComplete: false,
    isKnockoutStageComplete: false,
    isTournamentComplete: false,
    selectedTeams: [],
    top16Teams: [],
    groups: [],
    groupStandings: [],
    roundOf16Matches: [],
    quarterFinalMatches: [],
    semiFinalMatches: [],
    finalMatch: null,
    champion: null,
    runnerUp: null,
    semiFinalTeams: [],
    totalMatches: 0,
    totalGoals: 0,
    penaltyShootouts: 0,
    biggestWin: null
  };

  private tournamentState$ = new BehaviorSubject<TournamentState>(this.initialState);

  constructor() {
    // Try to load state from session storage on initialization
    this.loadStateFromStorage();
  }

  // Get current tournament state
  getTournamentState(): Observable<TournamentState> {
    return this.tournamentState$.asObservable();
  }

  // Get current state value
  getCurrentState(): TournamentState {
    return this.tournamentState$.value;
  }

  // Update selected teams
  updateSelectedTeams(teams: Team[]): void {
    const currentState = this.getCurrentState();
    this.updateState({
      ...currentState,
      selectedTeams: teams
    });
  }

  // Update group stage completion
  completeGroupStage(groups: Group[], groupStandings: GroupStandings[], top16: Team[]): void {
    const currentState = this.getCurrentState();
    this.updateState({
      ...currentState,
      groups,
      groupStandings,
      top16Teams: top16,
      isGroupStageComplete: true
    });
  }

  // Update knockout stage progress
  updateKnockoutProgress(
    roundOf16: KnockoutMatch[],
    quarterFinals: KnockoutMatch[],
    semiFinals: KnockoutMatch[],
    final: KnockoutMatch | null
  ): void {
    const currentState = this.getCurrentState();
    
    // Check if tournament is complete
    const isTournamentComplete = final?.played ?? false;
    let champion: Team | null = null;
    let runnerUp: Team | null = null;
    let semiFinalTeams: Team[] = [];

    if (isTournamentComplete && final) {
      // Determine champion and runner-up
      if (final.winner === final.teamA.name) {
        champion = final.teamA;
        runnerUp = final.teamB;
      } else {
        champion = final.teamB;
        runnerUp = final.teamA;
      }

      // Get all semifinal teams
      semiFinalTeams = [
        ...semiFinals.flatMap(match => [match.teamA, match.teamB])
      ];
    }

    this.updateState({
      ...currentState,
      roundOf16Matches: roundOf16,
      quarterFinalMatches: quarterFinals,
      semiFinalMatches: semiFinals,
      finalMatch: final,
      isKnockoutStageComplete: this.areAllKnockoutMatchesComplete(roundOf16, quarterFinals, semiFinals, final),
      isTournamentComplete,
      champion,
      runnerUp,
      semiFinalTeams
    });

    // Calculate and update statistics
    if (isTournamentComplete) {
      this.calculateTournamentStatistics();
    }
  }

  // Calculate tournament statistics
  private calculateTournamentStatistics(): void {
    const currentState = this.getCurrentState();
    let totalGoals = 0;
    let totalMatches = 0;
    let penaltyShootouts = 0;
    let biggestWinDifference = 0;
    let biggestWin: { match: string; score: string; difference: number } | null = null;

    // Calculate from all knockout matches
    const allKnockoutMatches = [
      ...currentState.roundOf16Matches,
      ...currentState.quarterFinalMatches,
      ...currentState.semiFinalMatches,
      ...(currentState.finalMatch ? [currentState.finalMatch] : [])
    ];

    allKnockoutMatches.forEach(match => {
      if (match.played && match.scoreA !== undefined && match.scoreB !== undefined) {
        totalMatches++;
        const matchGoals = match.scoreA + match.scoreB;
        totalGoals += matchGoals;

        if (match.wentToPenalties) {
          penaltyShootouts++;
        }

        const goalDifference = Math.abs(match.scoreA - match.scoreB);
        if (goalDifference > biggestWinDifference) {
          biggestWinDifference = goalDifference;
          biggestWin = {
            match: `${match.teamA.name} vs ${match.teamB.name}`,
            score: `${match.scoreA}-${match.scoreB}`,
            difference: goalDifference
          };
        }
      }
    });

    // Add estimated group stage stats
    if (currentState.isGroupStageComplete) {
      totalMatches += 48; // 8 groups × 6 matches per group
      totalGoals += Math.floor(totalGoals * 1.5); // Estimate group stage goals
    }

    this.updateState({
      ...currentState,
      totalMatches,
      totalGoals,
      penaltyShootouts,
      biggestWin
    });
  }

  // Check if all knockout matches are complete
  private areAllKnockoutMatchesComplete(
    roundOf16: KnockoutMatch[],
    quarterFinals: KnockoutMatch[],
    semiFinals: KnockoutMatch[],
    final: KnockoutMatch | null
  ): boolean {
    const allRoundOf16Complete = roundOf16.every(match => match.played);
    const allQuarterFinalsComplete = quarterFinals.every(match => match.played);
    const allSemiFinalsComplete = semiFinals.every(match => match.played);
    const finalComplete = final?.played ?? false;

    return allRoundOf16Complete && allQuarterFinalsComplete && allSemiFinalsComplete && finalComplete;
  }

  // Reset tournament
  resetTournament(): void {
    this.updateState(this.initialState);
    sessionStorage.removeItem('tournamentState');
  }

  // Update state and save to storage
  private updateState(newState: TournamentState): void {
    this.tournamentState$.next(newState);
    this.saveStateToStorage(newState);
  }

  // Save state to session storage
  private saveStateToStorage(state: TournamentState): void {
    try {
      sessionStorage.setItem('tournamentState', JSON.stringify(state));
    } catch (error) {
      console.warn('Could not save tournament state to storage:', error);
    }
  }

  // Load state from session storage
  private loadStateFromStorage(): void {
    try {
      const savedState = sessionStorage.getItem('tournamentState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.tournamentState$.next({ ...this.initialState, ...parsedState });
      }
    } catch (error) {
      console.warn('Could not load tournament state from storage:', error);
    }
  }
}
