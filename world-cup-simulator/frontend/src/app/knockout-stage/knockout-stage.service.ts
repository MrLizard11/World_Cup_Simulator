import { Injectable } from '@angular/core';
import { Team } from '../models';
import { Group, Match, GroupStandings, TeamStanding } from '../models/group.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { KnockoutMatch } from '../models/knockouts.model';
import { MatchesService } from '../group-stage/matches.service';
import { TournamentStateService } from '../summary-page/tournament-state.service';
import { KnockoutStage2ndService } from './knockout-stage-2nd.service';

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
  thirdPlaceMatch: KnockoutMatch | null = null;
  finalMatch: KnockoutMatch | null = null;

  constructor(
    private tournamentState: TournamentStateService,
    private simulationService: KnockoutStage2ndService
  ) { }

  resetKnockoutStage(): void {
    
    // Only reset the match data and tournament structure
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    this.leftBracketQuarterFinals = [];
    this.rightBracketQuarterFinals = [];
    this.leftBracketSemiFinal = null;
    this.rightBracketSemiFinal = null;
    this.thirdPlaceMatch = null;
    this.finalMatch = null;
  }

  // Complete reset for starting a new tournament
  complete(): void {
    this.top16 = [];
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    this.leftBracketQuarterFinals = [];
    this.rightBracketQuarterFinals = [];
    this.leftBracketSemiFinal = null;
    this.rightBracketSemiFinal = null;
    this.thirdPlaceMatch = null;
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
   getTop16Teams(groupStandings: TeamStanding[]): Team[] { 
    try {
      // Group standings by group and get top 2 from each group
      const qualifiedTeams: Team[] = [];

      // Get all group IDs (1-8)
      const groupIds = [...new Set(groupStandings.map(standing => standing.groupId))];
      
      if (groupIds.length !== 8) {
        throw new Error(`Expected 8 groups, found ${groupIds.length}`);
      }
      
      groupIds.forEach(groupId => {
        // Get standings for this group, sorted by points, then goal difference, and then goals for
        const groupTeams = groupStandings
          .filter(standing => standing.groupId === groupId)
          .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
          });
        
        if (groupTeams.length < 2) {
          throw new Error(`Group ${groupId} has insufficient teams: ${groupTeams.length}`);
        }
        
        // Take top 2 teams from each group
        const top2 = groupTeams.slice(0, 2);
        qualifiedTeams.push(...top2.map(standing => standing.team));
      });
      
      if (qualifiedTeams.length !== 16) {
        throw new Error(`Expected 16 qualified teams, got ${qualifiedTeams.length}`);
      }
      
      this.top16 = qualifiedTeams;
      return this.top16;
    } catch (error) {
      console.error('Error getting top 16 teams:', error);
      return [];
    }
  }

  // Draw Round of 16 matches based on top 16 teams
  drawRoundOf16Matches(top16: Team[]): void {
    try {
      if (top16.length < 16) {
        throw new Error(`Not enough teams to draw Round of 16 matches: ${top16.length}/16`);
      }

      // Clear previous matches
      this.leftBracketRoundOf16 = [];
      this.rightBracketRoundOf16 = [];
    
      // Extract winners and runners-up from each group
      // top16 array is ordered: [A1, A2, B1, B2, C1, C2, D1, D2, E1, E2, F1, F2, G1, G2, H1, H2]
      const groupWinners = [];
      const groupRunnersUp = [];
      
      for (let i = 0; i < 16; i += 2) {
        groupWinners.push(top16[i]);     // Winners: A1, B1, C1, D1, E1, F1, G1, H1
        groupRunnersUp.push(top16[i + 1]); // Runners-up: A2, B2, C2, D2, E2, F2, G2, H2
      }

      // Left bracket
      this.leftBracketRoundOf16.push({
        teamA: groupWinners[0], // Winner Group A
        teamB: groupRunnersUp[1], // Runner-up Group B
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.leftBracketRoundOf16.push({
        teamA: groupWinners[2], // Winner Group C
        teamB: groupRunnersUp[3], // Runner-up Group D
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.leftBracketRoundOf16.push({
        teamA: groupWinners[4], // Winner Group E
        teamB: groupRunnersUp[5], // Runner-up Group F
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.leftBracketRoundOf16.push({
        teamA: groupWinners[6], // Winner Group G
        teamB: groupRunnersUp[7], // Runner-up Group H
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      // Right bracket
      this.rightBracketRoundOf16.push({
        teamA: groupWinners[1], // Winner Group B
        teamB: groupRunnersUp[0], // Runner-up Group A
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.rightBracketRoundOf16.push({
        teamA: groupWinners[3], // Winner Group D
        teamB: groupRunnersUp[2], // Runner-up Group C
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.rightBracketRoundOf16.push({
        teamA: groupWinners[5], // Winner Group F
        teamB: groupRunnersUp[4], // Runner-up Group E
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      this.rightBracketRoundOf16.push({
        teamA: groupWinners[7], // Winner Group H
        teamB: groupRunnersUp[6], // Runner-up Group G
        scoreA: undefined,
        scoreB: undefined,
        penaltyScoreA: undefined,
        penaltyScoreB: undefined,
        wentToPenalties: false,
        played: false,
        round: 'round-of-16',
        winner: ''
      });

      console.log('🏆 FIFA-style Round of 16 Draw:');
      console.log('Left Bracket:');
      this.leftBracketRoundOf16.forEach((match, index) => {
        console.log(`  Match ${index + 1}: ${match.teamA.name} vs ${match.teamB.name}`);
      });
      console.log('Right Bracket:');
      this.rightBracketRoundOf16.forEach((match, index) => {
        console.log(`  Match ${index + 5}: ${match.teamA.name} vs ${match.teamB.name}`);
      });

    } catch (error) {
      console.error('Error drawing Round of 16 matches:', error);
      // Reset brackets on error
      this.leftBracketRoundOf16 = [];
      this.rightBracketRoundOf16 = [];
    }
  }

  // Simulate a match in the knockout stage
  simulateMatch(match: KnockoutMatch): void {
    this.simulationService.simulateMatch(match);
    
    // Update tournament state after each match
    this.updateTournamentState();
  }

  // Update tournament state with current knockout progress
  private updateTournamentState(): void {
    const allRoundOf16 = [...this.leftBracketRoundOf16, ...this.rightBracketRoundOf16];
    const allQuarterFinals = [...this.leftBracketQuarterFinals, ...this.rightBracketQuarterFinals];
    const allSemiFinals = [this.leftBracketSemiFinal, this.rightBracketSemiFinal].filter(match => match !== null) as KnockoutMatch[];
    
    this.tournamentState.updateKnockoutProgress(
      allRoundOf16,
      allQuarterFinals,
      allSemiFinals,
      this.thirdPlaceMatch,
      this.finalMatch
    );
  }

  // Advance winners from Round of 16 to Quarter Finals
  advanceToQuarterFinals(): void {
    const quarterFinalMatches = this.simulationService.advanceToQuarterFinals(
      this.leftBracketRoundOf16,
      this.rightBracketRoundOf16
    );
    
    this.leftBracketQuarterFinals = quarterFinalMatches.leftBracketQuarterFinals;
    this.rightBracketQuarterFinals = quarterFinalMatches.rightBracketQuarterFinals;
    
    this.updateTournamentState();
  }

  // Advance winners from Quarter Finals to Semi Finals
  advanceToSemiFinals(): void {
    const semiFinalMatches = this.simulationService.advanceToSemiFinals(
      this.leftBracketQuarterFinals,
      this.rightBracketQuarterFinals
    );
    
    this.leftBracketSemiFinal = semiFinalMatches.leftBracketSemiFinal;
    this.rightBracketSemiFinal = semiFinalMatches.rightBracketSemiFinal;
    
    this.updateTournamentState();
  } 

  // Advance winners from Semi Finals to Finals and create 3rd place match
  advanceToFinals(): void {
    const finalMatch = this.simulationService.advanceToFinal(
      this.leftBracketSemiFinal,
      this.rightBracketSemiFinal
    );
    
    const thirdPlaceMatch = this.simulationService.createThirdPlaceMatch(
      this.leftBracketSemiFinal,
      this.rightBracketSemiFinal
    );
    
    this.finalMatch = finalMatch;
    this.thirdPlaceMatch = thirdPlaceMatch;
    
    this.updateTournamentState();
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
    const status = this.simulationService.analyzeRoundCompletionStatus(
      this.leftBracketRoundOf16,
      this.rightBracketRoundOf16,
      this.leftBracketQuarterFinals,
      this.rightBracketQuarterFinals,
      this.leftBracketSemiFinal,
      this.rightBracketSemiFinal,
      this.finalMatch
    );

    // Auto-advance if rounds are completed but next round isn't set up
    if (status.roundOf16Completed && this.leftBracketQuarterFinals.length === 0 && this.rightBracketQuarterFinals.length === 0) {
      this.checkAndAdvanceToQuarterFinals();
    }
    
    if (status.quarterFinalsCompleted && !this.leftBracketSemiFinal && !this.rightBracketSemiFinal) {
      this.checkAndAdvanceToSemiFinals();
    }
    
    if (status.semiFinalsCompleted && !this.finalMatch) {
      this.checkAndAdvanceToFinals();
    }

    return {
      roundOf16: status.roundOf16Completed,
      quarterFinals: status.quarterFinalsCompleted,
      semiFinals: status.semiFinalsCompleted,
      final: status.finalCompleted
    };
  }

  // Update round completion status and return necessary state changes
  updateRoundCompletionStatus(componentState: {
    roundOf16Simulated: boolean,
    quarterFinalsSimulated: boolean,
    semiFinalsSimulated: boolean,
    thirdPlaceSimulated: boolean,
    finalSimulated: boolean,
    allMatchesSimulated: boolean
  }): {
    shouldUpdateState: boolean,
    updates: {
      roundOf16Simulated?: boolean,
      quarterFinalsSimulated?: boolean,
      semiFinalsSimulated?: boolean,
      thirdPlaceSimulated?: boolean,
      finalSimulated?: boolean,
      allMatchesSimulated?: boolean
    }
  } {
    const completionStatus = this.checkRoundCompletionStatus();
    const updates: {
      roundOf16Simulated?: boolean,
      quarterFinalsSimulated?: boolean,
      semiFinalsSimulated?: boolean,
      thirdPlaceSimulated?: boolean,
      finalSimulated?: boolean,
      allMatchesSimulated?: boolean
    } = {};
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

    // Check Third Place Match completion
    if (!componentState.thirdPlaceSimulated && this.thirdPlaceMatch?.played) {
      updates.thirdPlaceSimulated = true;
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
    const newThirdPlaceState = updates.thirdPlaceSimulated ?? componentState.thirdPlaceSimulated;
    const newFinalState = updates.finalSimulated ?? componentState.finalSimulated;

    if (!componentState.allMatchesSimulated && 
        newRoundOf16State && 
        newQuarterFinalsState && 
        newSemiFinalsState && 
        newThirdPlaceState &&
        newFinalState) {
      updates.allMatchesSimulated = true;
      shouldUpdateState = true;
    }

    return {
      shouldUpdateState,
      updates
    };
  }

  // Initialize knockout stage - called from component's ngOnInit
  initializeKnockoutStage(): {
    top16: Team[];
    leftBracketRoundOf16: KnockoutMatch[];
    rightBracketRoundOf16: KnockoutMatch[];
    leftBracketQuarterFinals: KnockoutMatch[];
    rightBracketQuarterFinals: KnockoutMatch[];
    leftBracketSemiFinal: KnockoutMatch | null;
    rightBracketSemiFinal: KnockoutMatch | null;
    finalMatch: KnockoutMatch | null;
    roundCompletionStatus: {
      roundOf16Simulated: boolean;
      quarterFinalsSimulated: boolean;
      semiFinalsSimulated: boolean;
      finalSimulated: boolean;
      allMatchesSimulated: boolean;
    }
  } {
    // Reset service state first to ensure clean initialization
    this.resetKnockoutStage();

    // Load top 16 teams
    this.loadTop16Teams();

    // Initialize knockout stage if we have enough teams
    if (this.top16.length >= 16) {
      // Draw the round of 16 matches using the loaded teams
      this.drawRoundOf16Matches(this.top16);
    } else {
      console.error('Not enough teams loaded for knockout stage. Found:', this.top16.length);
    }

    // Return the initialized state
    return {
      top16: this.top16,
      leftBracketRoundOf16: this.leftBracketRoundOf16,
      rightBracketRoundOf16: this.rightBracketRoundOf16,
      leftBracketQuarterFinals: this.leftBracketQuarterFinals,
      rightBracketQuarterFinals: this.rightBracketQuarterFinals,
      leftBracketSemiFinal: this.leftBracketSemiFinal,
      rightBracketSemiFinal: this.rightBracketSemiFinal,
      finalMatch: this.finalMatch,
      roundCompletionStatus: {
        roundOf16Simulated: false,
        quarterFinalsSimulated: false,
        semiFinalsSimulated: false,
        finalSimulated: false,
        allMatchesSimulated: false
      }
    };
  }

  // Cleanup method - called from component's ngOnDestroy
  cleanupKnockoutStage(): void {
    try {
      // Reset the knockout stage when leaving the page
      this.resetKnockoutStage();
      // Knockout stage service cleaned up successfully
    } catch (error) {
      console.error('Error during knockout stage cleanup:', error);
    }
  }

}
