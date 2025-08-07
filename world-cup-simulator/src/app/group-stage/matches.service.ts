import { Injectable } from '@angular/core';
import { Team } from '../models';
import { Group, Match, GroupStandings } from '../models/group.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { KnockoutMatch } from '../models/knockouts.model';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {

  groupStandings: any[] = [];
  top16: Team[] = [];
  roundOf16Matches: KnockoutMatch[] | undefined;

  constructor() { }

  resetGroupStage(): void {
    // Reset match simulation data but preserve team data for navigation
    this.groupStandings = [];
    // this.top16 = []; // Don't reset - will be regenerated when needed
    this.roundOf16Matches = undefined;
    console.log('Group stage match data reset (team data preserved)');
  }

  // Complete reset for starting a new tournament
  completeReset(): void {
    this.groupStandings = [];
    this.top16 = [];
    this.roundOf16Matches = undefined;
    
    // Clear session storage
    sessionStorage.removeItem('selectedTeams');
    sessionStorage.removeItem('top16Teams');
    console.log('Complete group stage reset including teams');
  }

  generateGroupMatches(selectedTeams: Team[]): Group[] {
    if (selectedTeams.length !== 32) {
      console.error('Expected 32 teams for World Cup format');
      return [];
    }

    const groups: Group[] = [];
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Shuffle the teams randomly before dividing into groups
    const shuffledTeams = this.shuffleArray([...selectedTeams]);

    // Divide shuffled teams into 8 groups of 4 teams each
    for (let i = 0; i < 8; i++) {
      const groupTeams = shuffledTeams.slice(i * 4, (i + 1) * 4);
      const matches = this.generateMatchesForGroup(groupTeams, i + 1);

      groups.push({
        id: i + 1,
        name: groupNames[i],
        teams: groupTeams,
        matches: matches
      });
    }

    return groups;
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

  initializeGroupStandings(groups: Group[]): any[] {
    const allStandings: any[] = [];

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
    return new BehaviorSubject(group).asObservable();
  }

  // Simulate a match between two teams by generating random score for each between 0 and 4
  simulateMatch(teamA: Team, teamB: Team): Observable<{ teamA: Team, teamB: Team, scoreA: number, scoreB: number }> {
    const scoreA = Math.floor(Math.random() * 5);
    const scoreB = Math.floor(Math.random() * 5);

    return new BehaviorSubject({
      teamA: teamA,
      teamB: teamB,
      scoreA: scoreA,
      scoreB: scoreB
    }).asObservable();
  }

  updateStandingsAfterMatch(match: any, groupStandings: any[]) {
    // Find standings for both teams
    const teamAStanding = groupStandings.find(s => s.team.name === match.teamA.name);
    const teamBStanding = groupStandings.find(s => s.team.name === match.teamB.name);

    if (teamAStanding && teamBStanding) {
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

}
