import { Injectable } from '@angular/core';
import { Team } from '../models';
import { Group, Match, GroupStandings, TeamStanding } from '../models/group.model';
import { Observable, forkJoin, of, switchMap, map, throwError } from 'rxjs';
import { KnockoutMatch } from '../models/knockouts.model';
import { TournamentStateService } from '../summary-page/tournament-state.service';
import { SimulationModeService } from '../shared/services/simulation-mode.service';
import { EloUpdateService } from '../shared/services/elo-update.service';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {

  groupStandings: TeamStanding[] = [];
  top16: Team[] = [];
  roundOf16Matches: KnockoutMatch[] | undefined;

  constructor(
    private tournamentState: TournamentStateService,
    private simulationModeService: SimulationModeService,
    private eloUpdateService: EloUpdateService
  ) { }

  resetGroupStage(): void {
    try {
      // Reset match simulation data but preserve team data for navigation
      this.groupStandings = [];
      // this.top16 = []; // Don't reset - will be regenerated when needed
      this.roundOf16Matches = undefined;
      // Group stage match data reset successfully (team data preserved)
    } catch (error) {
      console.error('Error resetting group stage:', error);
    }
  }

  // Complete reset for starting a new tournament
  completeReset(): void {
    try {
      this.groupStandings = [];
      this.top16 = [];
      this.roundOf16Matches = undefined;
      
      // Clear session storage
      sessionStorage.removeItem('selectedTeams');
      sessionStorage.removeItem('top16Teams');
      // Complete group stage reset including teams - successful
    } catch (error) {
      console.error('Error during complete reset:', error);
    }
  }

  generateGroupMatches(selectedTeams: Team[]): Group[] {
    try {
      if (selectedTeams.length !== 32) {
        throw new Error(`Expected 32 teams for World Cup format, received ${selectedTeams.length}`);
      }

      const groups: Group[] = [];
      const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      // Sort teams by Elo rating (highest to lowest) for seeding
      const sortedTeams = [...selectedTeams].sort((a, b) => b.elo - a.elo);

      // Create 4 pots of 8 teams each (FIFA-style seeding)
      const pot1 = sortedTeams.slice(0, 8);   // Top 8 teams (highest Elo)
      const pot2 = sortedTeams.slice(8, 16);  // Teams 9-16
      const pot3 = sortedTeams.slice(16, 24); // Teams 17-24
      const pot4 = sortedTeams.slice(24, 32); // Bottom 8 teams (lowest Elo)

      // Shuffle each pot to add some randomness within strength tiers
      const shuffledPot1 = this.shuffleArray(pot1);
      const shuffledPot2 = this.shuffleArray(pot2);
      const shuffledPot3 = this.shuffleArray(pot3);
      const shuffledPot4 = this.shuffleArray(pot4);

      // Assign teams to groups: one team from each pot per group
      for (let i = 0; i < 8; i++) {
        const groupTeams = [
          shuffledPot1[i], // One top-seeded team
          shuffledPot2[i], // One second-tier team
          shuffledPot3[i], // One third-tier team
          shuffledPot4[i]  // One bottom-seeded team
        ];
        const matches = this.generateMatchesForGroup(groupTeams, i + 1);

        groups.push({
          id: i + 1,
          name: groupNames[i],
          teams: groupTeams,
          matches: matches
        });
      }

      return groups;
    } catch (error) {
      console.error('Error generating group matches:', error);
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateMatchesForGroup(teams: Team[], groupId: number): Match[] {
    const matches: Match[] = [];
    let matchId = 1;

    // Generate all possible matches between 4 teams (6 matches total)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: matchId++,
          teamA: teams[i],
          teamB: teams[j],
          scoreA: 0,
          scoreB: 0,
          played: false
        });
      }
    }

    return matches;
  }

  initializeGroupStandings(groups: Group[]): TeamStanding[] {
    const allStandings: TeamStanding[] = [];

    groups.forEach(group => {
      group.teams.forEach(team => {
        allStandings.push({
          groupId: group.id,
          groupName: group.name,
          team: team,
          points: 0,
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0
        });
      });
    });

    return allStandings;
  }

  runAllMatches(group: Group): Observable<Group> {
    const matchObservables = group.matches.map(match => this.simulateMatch(match.teamA, match.teamB));
    return of(group);
  }

  // Simulate a match between two teams using Elo ratings and realistic algorithms
  simulateMatch(teamA: Team, teamB: Team): Observable<{ teamA: Team, teamB: Team, scoreA: number, scoreB: number }> {
    // Use the current simulation mode
    return this.simulationModeService.simulateMatch(teamA, teamB).pipe(
      map(result => {
        // Update team Elo ratings based on match result
        const updatedTeams = this.eloUpdateService.updateTeamElosAfterMatch(
          teamA, 
          teamB, 
          result.scoreA, 
          result.scoreB
        );

        return {
          teamA: updatedTeams.teamA,  // Return updated team with new Elo
          teamB: updatedTeams.teamB,  // Return updated team with new Elo
          scoreA: result.scoreA,
          scoreB: result.scoreB
        };
      })
    );
  }

  updateStandingsAfterMatch(match: Match, groupStandings: TeamStanding[]) {
    // Find standings for both teams
    const teamAStanding = groupStandings.find(s => s.team.name === match.teamA.name);
    const teamBStanding = groupStandings.find(s => s.team.name === match.teamB.name);

    if (teamAStanding && teamBStanding) {
      // Update team references with new Elo ratings
      teamAStanding.team = match.teamA; // This will have the updated Elo
      teamBStanding.team = match.teamB; // This will have the updated Elo
      
      // Update matches played
      teamAStanding.matchesPlayed++;
      teamBStanding.matchesPlayed++;

      // Update goals
      teamAStanding.goalsFor += match.scoreA;
      teamAStanding.goalsAgainst += match.scoreB;
      teamBStanding.goalsFor += match.scoreB;
      teamBStanding.goalsAgainst += match.scoreA;

      // Update goal difference
      teamAStanding.goalDifference = teamAStanding.goalsFor - teamAStanding.goalsAgainst;
      teamBStanding.goalDifference = teamBStanding.goalsFor - teamBStanding.goalsAgainst;

      // Update win/draw/loss and points
      if (match.scoreA > match.scoreB) {
        // Team A wins
        teamAStanding.wins++;
        teamAStanding.points += 3;
        teamBStanding.losses++;
      } else if (match.scoreB > match.scoreA) {
        // Team B wins
        teamBStanding.wins++;
        teamBStanding.points += 3;
        teamAStanding.losses++;
      } else {
        // Draw
        teamAStanding.draws++;
        teamBStanding.draws++;
        teamAStanding.points += 1;
        teamBStanding.points += 1;
      }
    }
  }

  getStandingsForGroup(groupId: number, groupStandings: TeamStanding[]): TeamStanding[] {
    return groupStandings
      .filter(standing => standing.groupId === groupId)
      .sort((a, b) => {
        // Sort by points (descending), then goal difference (descending), then goals for (descending)
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
  }

  simulateMatchInPlace(match: Match, groupStandings: TeamStanding[]): Observable<void> {
    try {
      // Use the current simulation mode instead of pure random
      return this.simulationModeService.simulateMatch(match.teamA, match.teamB).pipe(
        map(result => {
          match.scoreA = result.scoreA;
          match.scoreB = result.scoreB;
          match.played = true;

          // Update standings
          this.updateStandingsAfterMatch(match, groupStandings);

          // Match simulated successfully
          return undefined;
        })
      );
    } catch (error) {
      console.error(`Error simulating match between ${match.teamA.name} and ${match.teamB.name}:`, error);
      // Reset match state on error
      match.played = false;
      match.scoreA = 0;
      match.scoreB = 0;
  return of(undefined);
    }
  }

  runAllMatchesInGroups(groups: Group[], groupStandings: TeamStanding[]): Observable<void> {
    try {
  const simulationObservables: Observable<void>[] = [];
      
      // Collect all simulation observables
      groups.forEach(group => {
        group.matches.forEach(match => {
          if (!match.played) {
            simulationObservables.push(this.simulateMatchInPlace(match, groupStandings));
          }
        });
      });
      
      // If no matches to simulate, return completed observable
      if (simulationObservables.length === 0) {
        return of(undefined);
      }

      // Run all simulations and wait for completion using forkJoin to avoid untracked subscriptions
      return forkJoin(simulationObservables).pipe(
        map(() => undefined)
      );
      
    } catch (error) {
      console.error('Error simulating group matches:', error);
      return throwError(() => new Error('Failed to complete group stage simulation'));
    }
  }

  canProceedToNextStage(groups: Group[]): boolean {
    // Check if all matches have been played
    return groups.every(group => group.matches.every(match => match.played));
  }

  initializeFromSessionStorage(): { selectedTeams: Team[], shouldRedirect: boolean } {
    // Get the selected teams from sessionStorage
    const storedTeams = sessionStorage.getItem('selectedTeams');
    if (storedTeams) {
      try {
        const selectedTeams = JSON.parse(storedTeams);
        return { selectedTeams, shouldRedirect: false };
      } catch (error) {
        console.error('Error parsing stored teams:', error);
        return { selectedTeams: [], shouldRedirect: true };
      }
    }
    
    // No teams found - need to redirect
    return { selectedTeams: [], shouldRedirect: true };
  }

  initializeGroupStageData(selectedTeams: Team[]): { groups: Group[], groupStandings: TeamStanding[] } {
    const groups = this.generateGroupMatches(selectedTeams);
    const groupStandings = this.initializeGroupStandings(groups);
    return { groups, groupStandings };
  }

  cleanupGroupStage(): void {
    // Reset the service and clear match simulation data
    this.resetGroupStage();
  }

  processNextStageTransition(groupStandings: TeamStanding[], groups: Group[], tournamentState: TournamentStateService): { success: boolean, top16?: Team[], error?: string } {
    // Business logic for transitioning to next stage
    const top16Teams = this.getTop16Teams(groupStandings);
    
    if (top16Teams.length === 16) {
      // Store in session storage
      sessionStorage.setItem('top16Teams', JSON.stringify(top16Teams));
      
      // Convert TeamStanding[] to GroupStandings[] format for tournament state
      const groupStandingsFormatted = this.convertToGroupStandings(groupStandings);
      
      // Update tournament state
      tournamentState.completeGroupStage(groups, groupStandingsFormatted, top16Teams);
      
      return { success: true, top16: top16Teams };
    } else {
      return { 
        success: false, 
        error: `Expected 16 teams, but got ${top16Teams.length}. Cannot proceed to knockout stage.` 
      };
    }
  }

  private convertToGroupStandings(teamStandings: TeamStanding[]): GroupStandings[] {
    const groupStandings: GroupStandings[] = [];
    
    // Group by groupId
    for (let groupId = 1; groupId <= 8; groupId++) {
      const groupTeamStandings = teamStandings
        .filter(standing => standing.groupId === groupId)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
      
      if (groupTeamStandings.length > 0) {
        groupStandings.push({
          groupId: groupId,
          standings: groupTeamStandings.map(teamStanding => ({
            team: teamStanding.team,
            points: teamStanding.points,
            matchesPlayed: teamStanding.matchesPlayed,
            wins: teamStanding.wins,
            draws: teamStanding.draws,
            losses: teamStanding.losses,
            goalsFor: teamStanding.goalsFor,
            goalsAgainst: teamStanding.goalsAgainst,
            goalDifference: teamStanding.goalDifference
          }))
        });
      }
    }
    
    return groupStandings;
  }

  private getTop16Teams(groupStandings: TeamStanding[]): Team[] {
    const top16: Team[] = [];
    
    // Get top 2 teams from each group (8 groups = 16 teams)
    for (let groupId = 1; groupId <= 8; groupId++) {
      const groupStanding = this.getStandingsForGroup(groupId, groupStandings);
      if (groupStanding.length >= 2) {
        top16.push(groupStanding[0].team, groupStanding[1].team);
      }
    }
    
    return top16;
  }

}
