import { Injectable } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';

@Injectable({
  providedIn: 'root'
})
export class KnockoutStage2ndService {

  constructor() { }

  // Simulate individual match logic
  simulateMatch(match: KnockoutMatch): void {
    if (match.played) return; // Don't simulate already played matches

    // Simple random score generation (0-4 goals each team)
    const scoreA = Math.floor(Math.random() * 5);
    const scoreB = Math.floor(Math.random() * 5);

    match.scoreA = scoreA;
    match.scoreB = scoreB;

    // Determine winner - if tied, go to penalties
    if (scoreA > scoreB) {
      match.winner = match.teamA.name;
    } else if (scoreB > scoreA) {
      match.winner = match.teamB.name;
    } else {
      // Penalty shootout for tied matches
      this.simulatePenalties(match);
    }

    match.played = true;
    console.log(`Match simulated: ${match.teamA.name} ${match.scoreA} - ${match.scoreB} ${match.teamB.name}`);
    
    if (match.wentToPenalties) {
      console.log(`Penalties: ${match.penaltyScoreA} - ${match.penaltyScoreB}`);
    }
  }

  // Simulate penalty shootout
  private simulatePenalties(match: KnockoutMatch): void {
    match.wentToPenalties = true;
    
    // Simple penalty simulation (3-5 penalties each)
    const penaltyScoreA = Math.floor(Math.random() * 3) + 3; // 3-5
    const penaltyScoreB = Math.floor(Math.random() * 3) + 3; // 3-5
    
    match.penaltyScoreA = penaltyScoreA;
    match.penaltyScoreB = penaltyScoreB;
    
    // Ensure someone wins in penalties
    if (penaltyScoreA >= penaltyScoreB) {
      match.winner = match.teamA.name;
    } else if (penaltyScoreB > penaltyScoreA) {
      match.winner = match.teamB.name;
    } else this.simulatePenalties(match); //run it again until a team wins
  }

  // Check if all matches in an array are played
  areAllMatchesPlayed(matches: KnockoutMatch[]): boolean {
    return matches.length > 0 && matches.every(match => match.played);
  }

  // Get winners from completed matches
  getWinners(matches: KnockoutMatch[]): Team[] {
    return matches
      .filter(match => match.played && match.winner)
      .map(match => {
        return match.winner === match.teamA.name ? match.teamA : match.teamB;
      });
  }

  // Create match from two teams
  createMatch(teamA: Team, teamB: Team, round: 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final'): KnockoutMatch {
    return {
      teamA,
      teamB,
      scoreA: 0,
      scoreB: 0,
      penaltyScoreA: undefined,
      penaltyScoreB: undefined,
      wentToPenalties: false,
      played: false,
      winner: '',
      round
    };
  }

  // Advanced to next round logic
  advanceToQuarterFinals(leftBracketR16: KnockoutMatch[], rightBracketR16: KnockoutMatch[]): {
    leftBracketQuarterFinals: KnockoutMatch[];
    rightBracketQuarterFinals: KnockoutMatch[];
  } {
    const leftWinners = this.getWinners(leftBracketR16);
    const rightWinners = this.getWinners(rightBracketR16);

    const leftBracketQuarterFinals: KnockoutMatch[] = [];
    const rightBracketQuarterFinals: KnockoutMatch[] = [];

    // Create quarter-final matches from R16 winners
    if (leftWinners.length >= 4) {
      leftBracketQuarterFinals.push(
        this.createMatch(leftWinners[0], leftWinners[1], 'quarter-finals'),
        this.createMatch(leftWinners[2], leftWinners[3], 'quarter-finals')
      );
    }

    if (rightWinners.length >= 4) {
      rightBracketQuarterFinals.push(
        this.createMatch(rightWinners[0], rightWinners[1], 'quarter-finals'),
        this.createMatch(rightWinners[2], rightWinners[3], 'quarter-finals')
      );
    }

    return { leftBracketQuarterFinals, rightBracketQuarterFinals };
  }

  // Advance to semi-finals
  advanceToSemiFinals(leftBracketQF: KnockoutMatch[], rightBracketQF: KnockoutMatch[]): {
    leftBracketSemiFinal: KnockoutMatch | null;
    rightBracketSemiFinal: KnockoutMatch | null;
  } {
    const leftWinners = this.getWinners(leftBracketQF);
    const rightWinners = this.getWinners(rightBracketQF);

    let leftBracketSemiFinal: KnockoutMatch | null = null;
    let rightBracketSemiFinal: KnockoutMatch | null = null;

    if (leftWinners.length >= 2) {
      leftBracketSemiFinal = this.createMatch(leftWinners[0], leftWinners[1], 'semi-finals');
    }

    if (rightWinners.length >= 2) {
      rightBracketSemiFinal = this.createMatch(rightWinners[0], rightWinners[1], 'semi-finals');
    }

    return { leftBracketSemiFinal, rightBracketSemiFinal };
  }

  // Advance to final
  advanceToFinal(leftSemiFinal: KnockoutMatch | null, rightSemiFinal: KnockoutMatch | null): KnockoutMatch | null {
    if (!leftSemiFinal || !rightSemiFinal || !leftSemiFinal.played || !rightSemiFinal.played) {
      return null;
    }

    const leftWinner = leftSemiFinal.winner === leftSemiFinal.teamA.name ? leftSemiFinal.teamA : leftSemiFinal.teamB;
    const rightWinner = rightSemiFinal.winner === rightSemiFinal.teamA.name ? rightSemiFinal.teamA : rightSemiFinal.teamB;

    return this.createMatch(leftWinner, rightWinner, 'final');
  }

  // Check round completion status
  analyzeRoundCompletionStatus(
    leftBracketRoundOf16: KnockoutMatch[],
    rightBracketRoundOf16: KnockoutMatch[],
    leftBracketQuarterFinals: KnockoutMatch[],
    rightBracketQuarterFinals: KnockoutMatch[],
    leftBracketSemiFinal: KnockoutMatch | null,
    rightBracketSemiFinal: KnockoutMatch | null,
    finalMatch: KnockoutMatch | null
  ): {
    roundOf16Completed: boolean;
    quarterFinalsCompleted: boolean;
    semiFinalsCompleted: boolean;
    finalCompleted: boolean;
    allCompleted: boolean;
  } {
    const roundOf16Completed = this.areAllMatchesPlayed(leftBracketRoundOf16) && 
                               this.areAllMatchesPlayed(rightBracketRoundOf16);
    
    const quarterFinalsCompleted = this.areAllMatchesPlayed(leftBracketQuarterFinals) && 
                                   this.areAllMatchesPlayed(rightBracketQuarterFinals);
    
    const semiFinalsCompleted = leftBracketSemiFinal?.played === true && 
                                rightBracketSemiFinal?.played === true;
    
    const finalCompleted = finalMatch?.played === true;
    
    const allCompleted = roundOf16Completed && quarterFinalsCompleted && semiFinalsCompleted && finalCompleted;

    return {
      roundOf16Completed,
      quarterFinalsCompleted,
      semiFinalsCompleted,
      finalCompleted,
      allCompleted
    };
  }
}
