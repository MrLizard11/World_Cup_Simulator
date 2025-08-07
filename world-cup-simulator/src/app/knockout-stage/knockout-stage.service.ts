import { Injectable } from '@angular/core';
import { Team } from '../models';
import { Group, Match, GroupStandings } from '../models/group.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { KnockoutMatch } from '../models/knockouts.model';
import { MatchesService } from '../group-stage/matches.service';

@Injectable({
  providedIn: 'root'
})
export class KnockoutStageService {

  top16: Team[] = [];
  leftBracketRoundOf16: KnockoutMatch[] = [];
  rightBracketRoundOf16: KnockoutMatch[] = [];
  leftBracketQuarterFinals: KnockoutMatch[] = [];
  rightBracketQuarterFinals: KnockoutMatch[] = [];
  leftBracketSemiFinal: KnockoutMatch | null = null;
  rightBracketSemiFinal: KnockoutMatch | null = null;
  finalMatch: KnockoutMatch | null = null;

  constructor() { }

  resetKnockoutStage(): void {
    
    // Only reset the match data and tournament structure
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    this.leftBracketQuarterFinals = [];
    this.rightBracketQuarterFinals = [];
    this.leftBracketSemiFinal = null;
    this.rightBracketSemiFinal = null;
    this.finalMatch = null;
  }

  // Complete reset for starting a new tournament
  completeReset(): void {
    this.top16 = [];
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    this.leftBracketQuarterFinals = [];
    this.rightBracketQuarterFinals = [];
    this.leftBracketSemiFinal = null;
    this.rightBracketSemiFinal = null;
    this.finalMatch = null;
    
    // Clear session storage
    sessionStorage.removeItem('top16Teams');
  }

  // Load top 16 teams from session storage
  loadTop16Teams(): void {
    const storedTeams = sessionStorage.getItem('top16Teams');
    if (storedTeams) {
      try {
        this.top16 = JSON.parse(storedTeams);
      } catch (error) {
        console.error('Error parsing stored teams:', error);
        this.top16 = [];
      }
    } else {
      console.warn('No top16 teams found in sessionStorage');
    }
  }

  // Get top 16 teams from group standings
   getTop16Teams(groupStandings: any[]): Team[] { 

    // Group standings by group and get top 2 from each group
    const qualifiedTeams: Team[] = [];

    // Get all group IDs (1-8)
    const groupIds = [...new Set(groupStandings.map(standing => standing.groupId))];
    console.log('Found group IDs:', groupIds);
    
    groupIds.forEach(groupId => {
      // Get standings for this group, sorted by points, then goal difference, and then goals for
      const groupTeams = groupStandings
        .filter(standing => standing.groupId === groupId)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
      
      console.log(`Group ${groupId} teams:`, groupTeams);
      
      // Take top 2 teams from each group
      const top2 = groupTeams.slice(0, 2);
      qualifiedTeams.push(...top2.map(standing => standing.team));
    });
    this.top16 = qualifiedTeams;
    return this.top16;
  }

  // Draw Round of 16 matches based on top 16 teams
  drawRoundOf16Matches(top16: Team[]): void {
    if (top16.length < 16) {
      console.error('Not enough teams to draw Round of 16 matches');
      return;
    }

    // Clear previous matches
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    
    // Left bracket - first 8 teams (groups A,C,E,G winners + B,D,F,H runners-up)
    for (let i = 0; i < 4; i++) {
      this.leftBracketRoundOf16.push({
        teamA: top16[i],
        teamB: top16[i + 8],
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });
    }

    // Right bracket - remaining 8 teams (groups B,D,F,H winners + A,C,E,G runners-up)
    for (let i = 4; i < 8; i++) {
      this.rightBracketRoundOf16.push({
        teamA: top16[i],
        teamB: top16[i + 8],
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });
    }
  }

  // Simulate a match in the knockout stage
  simulateMatch(match: KnockoutMatch): void {
    match.scoreA = Math.floor(Math.random() * 5);
    match.scoreB = Math.floor(Math.random() * 5);
    match.played = true;
    if (match.scoreA > match.scoreB) {
      match.winner = match.teamA.name;
    } else if (match.scoreB > match.scoreA) {
      match.winner = match.teamB.name;
    } else {
      match.winner = 'Draw';
      match.wentToPenalties = true;
      this.simulatePenalties(match); // proceed to penalties
    }
  }

  // Simulate penalties for a match
  simulatePenalties(match: KnockoutMatch) {
    const penaltyScoreA = Math.floor(Math.random() * 5) + 1; // 1-5 penalties
    const penaltyScoreB = Math.floor(Math.random() * 5) + 1; // 1-5 penalties
    match.penaltyScoreA = penaltyScoreA;
    match.penaltyScoreB = penaltyScoreB;
    
    if (penaltyScoreA > penaltyScoreB) {
      match.winner = match.teamA.name;
    } else if (penaltyScoreB > penaltyScoreA) {
      match.winner = match.teamB.name;
    } else {
      this.simulatePenalties(match); // Keep trying until there's a winner
    }
  }

  // Advance winners from Round of 16 to Quarter Finals
  advanceToQuarterFinals(): void {
    // Left bracket quarter finals
    const leftR16Winners = this.leftBracketRoundOf16
      .filter(match => match.played)
      .map(match => this.getMatchWinner(match))
      .filter(winner => winner !== null);

    const rightR16Winners = this.rightBracketRoundOf16
      .filter(match => match.played)
      .map(match => this.getMatchWinner(match))
      .filter(winner => winner !== null);

    if (leftR16Winners.length === 4) {
      this.leftBracketQuarterFinals = [
        this.createMatch(leftR16Winners[0]!, leftR16Winners[1]!, 'quarter-finals'),
        this.createMatch(leftR16Winners[2]!, leftR16Winners[3]!, 'quarter-finals')
      ];
    }

    if (rightR16Winners.length === 4) {
      this.rightBracketQuarterFinals = [
        this.createMatch(rightR16Winners[0]!, rightR16Winners[1]!, 'quarter-finals'),
        this.createMatch(rightR16Winners[2]!, rightR16Winners[3]!, 'quarter-finals')
      ];
    }
  }

  private getMatchWinner(match: KnockoutMatch): Team | null {
    if (!match.played || !match.winner) return null;
    return match.winner === match.teamA.name ? match.teamA : match.teamB;
  }

  private createMatch(teamA: Team, teamB: Team, round: 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final'): KnockoutMatch {
    return {
      teamA,
      teamB,
      scoreA: undefined,
      scoreB: undefined,
      penaltyScoreA: undefined,
      penaltyScoreB: undefined,
      wentToPenalties: false,
      played: false,
      round,
      winner: ''
    };
  }

  // Advance winners from Quarter Finals to Semi Finals
  advanceToSemiFinals(): void {
    const leftQuarterWinners = this.leftBracketQuarterFinals
      .filter((match: KnockoutMatch) => match.played)
      .map((match: KnockoutMatch) => this.getMatchWinner(match))
      .filter((winner: Team | null) => winner !== null);

    const rightQuarterWinners = this.rightBracketQuarterFinals
      .filter((match: KnockoutMatch) => match.played)
      .map((match: KnockoutMatch) => this.getMatchWinner(match))
      .filter((winner: Team | null) => winner !== null);

    if (leftQuarterWinners.length === 2) {
      this.leftBracketSemiFinal = this.createMatch(leftQuarterWinners[0]!, leftQuarterWinners[1]!, 'semi-finals');
    }

    if (rightQuarterWinners.length === 2) {
      this.rightBracketSemiFinal = this.createMatch(rightQuarterWinners[0]!, rightQuarterWinners[1]!, 'semi-finals');
    }
  } 

  // Advance winners from Semi Finals to Finals
  advanceToFinals(): void {
    let leftSemiWinner: Team | null = null;
    let rightSemiWinner: Team | null = null;

    if (this.leftBracketSemiFinal && this.leftBracketSemiFinal.played) {
      leftSemiWinner = this.getMatchWinner(this.leftBracketSemiFinal);
    }

    if (this.rightBracketSemiFinal && this.rightBracketSemiFinal.played) {
      rightSemiWinner = this.getMatchWinner(this.rightBracketSemiFinal);
    }

    if (leftSemiWinner && rightSemiWinner) {
      this.finalMatch = this.createMatch(leftSemiWinner, rightSemiWinner, 'final');
    }
  }

  // Round completion checking methods
  areAllRoundOf16MatchesPlayed(): boolean {
    return this.leftBracketRoundOf16.every(match => match.played) && 
           this.rightBracketRoundOf16.every(match => match.played);
  }

  areAllQuarterFinalMatchesPlayed(): boolean {
    return this.leftBracketQuarterFinals.length > 0 &&
           this.rightBracketQuarterFinals.length > 0 &&
           this.leftBracketQuarterFinals.every(match => match.played) && 
           this.rightBracketQuarterFinals.every(match => match.played);
  }

  areAllSemiFinalMatchesPlayed(): boolean {
    return this.leftBracketSemiFinal !== null &&
           this.rightBracketSemiFinal !== null &&
           (this.leftBracketSemiFinal?.played || false) && 
           (this.rightBracketSemiFinal?.played || false);
  }

  // Automatic advancement methods
  checkAndAdvanceToQuarterFinals(): void {
    const leftComplete = this.leftBracketRoundOf16.every(match => match.played);
    const rightComplete = this.rightBracketRoundOf16.every(match => match.played);

    if (leftComplete && rightComplete) {
      this.advanceToQuarterFinals();
    }
  }

  checkAndAdvanceToSemiFinals(): void {
    const leftQuarterComplete = this.leftBracketQuarterFinals.every(match => match.played);
    const rightQuarterComplete = this.rightBracketQuarterFinals.every(match => match.played);

    if (leftQuarterComplete && rightQuarterComplete) {
      this.advanceToSemiFinals();
    }
  }

  checkAndAdvanceToFinals(): void {
    const leftSemiComplete = this.leftBracketSemiFinal?.played || false;
    const rightSemiComplete = this.rightBracketSemiFinal?.played || false;

    if (leftSemiComplete && rightSemiComplete) {
      this.advanceToFinals();
    }
  }

  // Round completion status tracking for simulate all round matches buttons
  checkRoundCompletionStatus(): { roundOf16: boolean, quarterFinals: boolean, semiFinals: boolean, final: boolean } {
    const roundOf16Complete = this.areAllRoundOf16MatchesPlayed();
    const quarterFinalsComplete = this.areAllQuarterFinalMatchesPlayed();
    const semiFinalsComplete = this.areAllSemiFinalMatchesPlayed();
    const finalComplete = this.finalMatch?.played || false;

    // Auto-advance if rounds are completed but next round isn't set up
    if (roundOf16Complete && this.leftBracketQuarterFinals.length === 0 && this.rightBracketQuarterFinals.length === 0) {
      this.checkAndAdvanceToQuarterFinals();
    }
    
    if (quarterFinalsComplete && !this.leftBracketSemiFinal && !this.rightBracketSemiFinal) {
      this.checkAndAdvanceToSemiFinals();
    }
    
    if (semiFinalsComplete && !this.finalMatch) {
      this.checkAndAdvanceToFinals();
    }

    return {
      roundOf16: roundOf16Complete,
      quarterFinals: quarterFinalsComplete,
      semiFinals: semiFinalsComplete,
      final: finalComplete
    };
  }

  // Update round completion status and return necessary state changes
  updateRoundCompletionStatus(componentState: {
    roundOf16Simulated: boolean,
    quarterFinalsSimulated: boolean,
    semiFinalsSimulated: boolean,
    finalSimulated: boolean,
    allMatchesSimulated: boolean
  }): {
    shouldUpdateState: boolean,
    updates: {
      roundOf16Simulated?: boolean,
      quarterFinalsSimulated?: boolean,
      semiFinalsSimulated?: boolean,
      finalSimulated?: boolean,
      allMatchesSimulated?: boolean
    }
  } {
    const completionStatus = this.checkRoundCompletionStatus();
    const updates: any = {};
    let shouldUpdateState = false;

    // Check Round of 16 completion
    if (!componentState.roundOf16Simulated && completionStatus.roundOf16) {
      updates.roundOf16Simulated = true;
      shouldUpdateState = true;
    }

    // Check Quarter Finals completion
    if (!componentState.quarterFinalsSimulated && completionStatus.quarterFinals) {
      updates.quarterFinalsSimulated = true;
      shouldUpdateState = true;
    }

    // Check Semi Finals completion
    if (!componentState.semiFinalsSimulated && completionStatus.semiFinals) {
      updates.semiFinalsSimulated = true;
      shouldUpdateState = true;
    }

    // Check Final completion
    if (!componentState.finalSimulated && completionStatus.final) {
      updates.finalSimulated = true;
      shouldUpdateState = true;
    }

    // Check if all matches are completed
    const newRoundOf16State = updates.roundOf16Simulated ?? componentState.roundOf16Simulated;
    const newQuarterFinalsState = updates.quarterFinalsSimulated ?? componentState.quarterFinalsSimulated;
    const newSemiFinalsState = updates.semiFinalsSimulated ?? componentState.semiFinalsSimulated;
    const newFinalState = updates.finalSimulated ?? componentState.finalSimulated;

    if (!componentState.allMatchesSimulated && 
        newRoundOf16State && 
        newQuarterFinalsState && 
        newSemiFinalsState && 
        newFinalState) {
      updates.allMatchesSimulated = true;
      shouldUpdateState = true;
    }

    return {
      shouldUpdateState,
      updates
    };
  }

}
