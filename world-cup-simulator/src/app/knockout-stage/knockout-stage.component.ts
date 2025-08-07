import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { KnockoutStageService } from './knockout-stage.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.css']
})
export class KnockoutStageComponent implements OnInit, OnDestroy {

  top16: Team[] = [];

  // Left bracket (Group A,C,E,G winners + Group B,D,F,H runners-up)
  leftBracketRoundOf16: KnockoutMatch[] = [];
  leftBracketQuarterFinals: KnockoutMatch[] = [];
  leftBracketSemiFinal: KnockoutMatch | null = null;

  // Right bracket (Group B,D,F,H winners + Group A,C,E,G runners-up)
  rightBracketRoundOf16: KnockoutMatch[] = [];
  rightBracketQuarterFinals: KnockoutMatch[] = [];
  rightBracketSemiFinal: KnockoutMatch | null = null;

  finalMatch: KnockoutMatch | null = null;
  champion: Team | null = null;

  // Round simulation tracking
  roundOf16Simulated: boolean = false;
  quarterFinalsSimulated: boolean = false;
  semiFinalsSimulated: boolean = false;
  finalSimulated: boolean = false;
  allMatchesSimulated: boolean = false;

  constructor(private knockoutStageService: KnockoutStageService) { }

  ngOnInit(): void {
    // Scroll to top when component initializes
    window.scrollTo(0, 0);

    // Reset service state first to ensure clean initialization
    this.knockoutStageService.resetKnockoutStage();

    this.knockoutStageService.loadTop16Teams();
    this.top16 = this.knockoutStageService.top16;
    this.initializeKnockoutStage();

    // Check initial round completion status (should be all false after reset)
    this.updateRoundCompletionFromService();
  }

  simulateMatch(match: KnockoutMatch) {
    this.knockoutStageService.simulateMatch(match);

    // Check if any rounds have been completed through individual match simulation
    this.updateRoundCompletionFromService();
  }

  initializeKnockoutStage(): void {
    if (this.top16.length >= 16) {
      // Draw the round of 16 matches using the loaded teams
      this.knockoutStageService.drawRoundOf16Matches(this.top16);

      // Get the drawn matches from the service
      this.leftBracketRoundOf16 = this.knockoutStageService.leftBracketRoundOf16 || [];
      this.rightBracketRoundOf16 = this.knockoutStageService.rightBracketRoundOf16 || [];

    } else {
      console.error('Not enough teams loaded for knockout stage. Found:', this.top16.length);
    }
  }

  runAllRoundOf16() {
    if (this.roundOf16Simulated) return;

    this.leftBracketRoundOf16.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.rightBracketRoundOf16.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.knockoutStageService.checkAndAdvanceToQuarterFinals();
    this.leftBracketQuarterFinals = this.knockoutStageService.leftBracketQuarterFinals;
    this.rightBracketQuarterFinals = this.knockoutStageService.rightBracketQuarterFinals;
    this.roundOf16Simulated = true;
  }
   runQuarterFinals() {
    if (this.quarterFinalsSimulated || !this.areAllRoundOf16MatchesPlayed()) return;

    this.leftBracketQuarterFinals.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.rightBracketQuarterFinals.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.knockoutStageService.checkAndAdvanceToSemiFinals();
    this.leftBracketSemiFinal = this.knockoutStageService.leftBracketSemiFinal;
    this.rightBracketSemiFinal = this.knockoutStageService.rightBracketSemiFinal;
    this.quarterFinalsSimulated = true;
  }

  runSemiFinals() {
    if (this.semiFinalsSimulated || !this.areAllQuarterFinalMatchesPlayed()) return;

    if (this.leftBracketSemiFinal && !this.leftBracketSemiFinal.played) {
      this.simulateMatch(this.leftBracketSemiFinal);
    }
    if (this.rightBracketSemiFinal && !this.rightBracketSemiFinal.played) {
      this.simulateMatch(this.rightBracketSemiFinal);
    }
    this.knockoutStageService.checkAndAdvanceToFinals();
    this.finalMatch = this.knockoutStageService.finalMatch;
    this.semiFinalsSimulated = true;
  }

  runFinal() {
    if (this.finalSimulated || !this.areAllSemiFinalMatchesPlayed()) return;

    if (this.finalMatch && !this.finalMatch.played) {
      this.simulateMatch(this.finalMatch);
    }
    this.finalSimulated = true;
  }

  // Simulate all matches in the knockout stage
  runAllMatches() {
    if (this.allMatchesSimulated) return;

    this.leftBracketRoundOf16.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.rightBracketRoundOf16.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.knockoutStageService.checkAndAdvanceToQuarterFinals();
    this.leftBracketQuarterFinals = this.knockoutStageService.leftBracketQuarterFinals;
    this.rightBracketQuarterFinals = this.knockoutStageService.rightBracketQuarterFinals;

    this.leftBracketQuarterFinals.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.rightBracketQuarterFinals.forEach(match => {
      if (!match.played) {
        this.simulateMatch(match);
      }
    });
    this.knockoutStageService.checkAndAdvanceToSemiFinals();
    this.leftBracketSemiFinal = this.knockoutStageService.leftBracketSemiFinal;
    this.rightBracketSemiFinal = this.knockoutStageService.rightBracketSemiFinal;

    if (this.leftBracketSemiFinal && !this.leftBracketSemiFinal.played) {
      this.simulateMatch(this.leftBracketSemiFinal);
    }
    if (this.rightBracketSemiFinal && !this.rightBracketSemiFinal.played) {
      this.simulateMatch(this.rightBracketSemiFinal);
    }
    this.knockoutStageService.checkAndAdvanceToFinals();
    this.finalMatch = this.knockoutStageService.finalMatch;

    if (this.finalMatch && !this.finalMatch.played) {
      this.simulateMatch(this.finalMatch);
    }

    // Set all flags to true when all matches are simulated
    this.allMatchesSimulated = true;
    this.roundOf16Simulated = true;
    this.quarterFinalsSimulated = true;
    this.semiFinalsSimulated = true;
    this.finalSimulated = true;
  } 

  isWinner(match: KnockoutMatch, team: 'A' | 'B'): boolean {
    if (!match.played || !match.winner) return false;
    const teamName = team === 'A' ? match.teamA.name : match.teamB.name;
    return match.winner === teamName;
  }

  getScoreDisplay(match: KnockoutMatch): string {
    if (!match.played) return '0 - 0';

    let display = `${match.scoreA || 0} - ${match.scoreB || 0}`;

    if (match.wentToPenalties && match.penaltyScoreA !== undefined && match.penaltyScoreB !== undefined) {
      display += ` (${match.penaltyScoreA} - ${match.penaltyScoreB} pens)`;
    }

    return display;
  }

  // Prerequisites checking methods for simulate all round matches buttons
  canSimulateQuarterFinals(): boolean {
    return this.areAllRoundOf16MatchesPlayed() && !this.quarterFinalsSimulated;
  }

  canSimulateSemiFinals(): boolean {
    return this.areAllQuarterFinalMatchesPlayed() && !this.semiFinalsSimulated;
  }

  canSimulateFinal(): boolean {
    return this.areAllSemiFinalMatchesPlayed() && !this.finalSimulated;
  }

  canSimulateAllMatches(): boolean {
    return !this.allMatchesSimulated;
  }

  canSimulateRoundOf16(): boolean {
    return !this.roundOf16Simulated;
  }

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

  private updateRoundCompletionFromService(): void { // Check the service for round completion status
    const result = this.knockoutStageService.updateRoundCompletionStatus({
      roundOf16Simulated: this.roundOf16Simulated,
      quarterFinalsSimulated: this.quarterFinalsSimulated,
      semiFinalsSimulated: this.semiFinalsSimulated,
      finalSimulated: this.finalSimulated,
      allMatchesSimulated: this.allMatchesSimulated
    });

    if (result.shouldUpdateState) {
      // Update component state flags based on service response
      if (result.updates.roundOf16Simulated !== undefined) {
        this.roundOf16Simulated = result.updates.roundOf16Simulated;
        // Update local bracket references
        this.leftBracketQuarterFinals = this.knockoutStageService.leftBracketQuarterFinals;
        this.rightBracketQuarterFinals = this.knockoutStageService.rightBracketQuarterFinals;
      }

      if (result.updates.quarterFinalsSimulated !== undefined) {
        this.quarterFinalsSimulated = result.updates.quarterFinalsSimulated;
        // Update local bracket references
        this.leftBracketSemiFinal = this.knockoutStageService.leftBracketSemiFinal;
        this.rightBracketSemiFinal = this.knockoutStageService.rightBracketSemiFinal;
      }

      if (result.updates.semiFinalsSimulated !== undefined) {
        this.semiFinalsSimulated = result.updates.semiFinalsSimulated;
        // Update local bracket reference
        this.finalMatch = this.knockoutStageService.finalMatch;
      }

      if (result.updates.finalSimulated !== undefined) {
        this.finalSimulated = result.updates.finalSimulated;
      }

      if (result.updates.allMatchesSimulated !== undefined) {
        this.allMatchesSimulated = result.updates.allMatchesSimulated;
      }
    }
  }

  ngOnDestroy(): void {
    // Reset the knockout stage when leaving the page
    this.knockoutStageService.resetKnockoutStage();

    // Reset component state
    this.top16 = [];
    this.leftBracketRoundOf16 = [];
    this.rightBracketRoundOf16 = [];
    this.leftBracketQuarterFinals = [];
    this.rightBracketQuarterFinals = [];
    this.leftBracketSemiFinal = null;
    this.rightBracketSemiFinal = null;
    this.finalMatch = null;
    this.champion = null;

    // Reset simulation tracking flags
    this.roundOf16Simulated = false;
    this.quarterFinalsSimulated = false;
    this.semiFinalsSimulated = false;
    this.finalSimulated = false;
    this.allMatchesSimulated = false;

    console.log('Knockout stage component destroyed and reset');
  }

}
