import { Injectable } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { SimulationModeService } from '../shared/services/simulation-mode.service';
import { EloUpdateService } from '../shared/services/elo-update.service';

@Injectable({
  providedIn: 'root'
})
export class KnockoutStage2ndService {

  constructor(
    private simulationModeService: SimulationModeService,
    private eloUpdateService: EloUpdateService
  ) { }

  // Simulate individual match logic
  simulateMatch(match: KnockoutMatch): void {
    try {
      if (match.played) return; // Don't simulate already played matches

      // Use the current simulation mode with situational factors
      const roundImportance = this.getRoundImportance(match.round);
      const result = this.simulationModeService.simulateMatch(
        match.teamA, 
        match.teamB, 
        {
          roundImportance,
          isNeutralVenue: true
        }
      );

      match.scoreA = result.scoreA;
      match.scoreB = result.scoreB;

      // Determine winner - if tied, go to penalties
      if (result.scoreA > result.scoreB) {
        match.winner = match.teamA.name;
      } else if (result.scoreB > result.scoreA) {
        match.winner = match.teamB.name;
      } else {
        // Penalty shootout for tied matches
        this.simulatePenalties(match);
      }

      match.played = true;

      // Update team Elo ratings after match (including penalty outcomes)
      const finalScoreA = match.scoreA!;
      const finalScoreB = match.scoreB!;
      
      // For penalty matches, adjust the score impact (draws go to Elo calculation as draws)
      let eloScoreA = finalScoreA;
      let eloScoreB = finalScoreB;
      
      // If penalties decided the match, treat as narrow victory for Elo calculation
      if (match.wentToPenalties) {
        if (match.winner === match.teamA.name) {
          eloScoreA = finalScoreA + 0.1; // Slight edge to winner
        } else {
          eloScoreB = finalScoreB + 0.1; // Slight edge to winner
        }
      }
      
      const updatedTeams = this.eloUpdateService.updateTeamElosAfterMatch(
        match.teamA,
        match.teamB,
        eloScoreA,
        eloScoreB
      );
      
      // Update match with new team Elo ratings
      match.teamA = updatedTeams.teamA;
      match.teamB = updatedTeams.teamB;
      
      // Log penalty results if needed
      if (match.wentToPenalties && match.penaltyScoreA !== undefined && match.penaltyScoreB !== undefined) {
        // Penalties were required for this match
      }
    } catch (error) {
      console.error(`Error simulating match between ${match.teamA.name} and ${match.teamB.name}:`, error);
      // Reset match state on error
      match.played = false;
      match.scoreA = undefined;
      match.scoreB = undefined;
      match.winner = '';
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
    if (penaltyScoreA > penaltyScoreB) {
      match.winner = match.teamA.name;
    } else if (penaltyScoreB > penaltyScoreA) {
      match.winner = match.teamB.name;
    } else this.simulatePenalties(match); //run it again until a team wins
  }

  /**
   * Get round importance multiplier for match simulation
   */
  private getRoundImportance(round: string): number {
    switch (round) {
      case 'final': return 1.2;
      case 'semi-finals': return 1.15;
      case 'quarter-finals': return 1.1;
      case 'round-of-16': return 1.05;
      case 'third-place': return 1.0;
      default: return 1.0;
    }
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
  createMatch(teamA: Team, teamB: Team, round: 'round-of-16' | 'quarter-finals' | 'semi-finals' | 'final' | 'third-place'): KnockoutMatch {
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

  // Create third place match from semifinal losers
  createThirdPlaceMatch(leftSemiFinal: KnockoutMatch | null, rightSemiFinal: KnockoutMatch | null): KnockoutMatch | null {
    if (!leftSemiFinal || !rightSemiFinal || !leftSemiFinal.played || !rightSemiFinal.played) {
      return null;
    }

    const leftLoser = leftSemiFinal.winner === leftSemiFinal.teamA.name ? leftSemiFinal.teamB : leftSemiFinal.teamA;
    const rightLoser = rightSemiFinal.winner === rightSemiFinal.teamA.name ? rightSemiFinal.teamB : rightSemiFinal.teamA;

    return this.createMatch(leftLoser, rightLoser, 'third-place');
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
