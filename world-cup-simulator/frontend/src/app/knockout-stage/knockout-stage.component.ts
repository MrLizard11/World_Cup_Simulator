import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { KnockoutStageService } from './knockout-stage.service';
import { SimulationMode } from '../shared/services/simulation-mode.service';

@Component({
  selector: 'app-knockout-stage',
  templateUrl: './knockout-stage.component.html',
  styleUrls: ['./knockout-stage.component.css']
})
export class KnockoutStageComponent implements OnInit, OnDestroy {

  // Round simulation tracking
  roundOf16Simulated: boolean = false;
  quarterFinalsSimulated: boolean = false;
  semiFinalsSimulated: boolean = false;
  thirdPlaceSimulated: boolean = false;
  finalSimulated: boolean = false;
  allMatchesSimulated: boolean = false;

  constructor(private knockoutStageService: KnockoutStageService) { }

  // Getter methods to access service data directly
  get top16(): Team[] {
    return this.knockoutStageService.top16;
  }

  get leftBracketRoundOf16(): KnockoutMatch[] {
    return this.knockoutStageService.leftBracketRoundOf16;
  }

  get rightBracketRoundOf16(): KnockoutMatch[] {
    return this.knockoutStageService.rightBracketRoundOf16;
  }

  get leftBracketQuarterFinals(): KnockoutMatch[] {
    return this.knockoutStageService.leftBracketQuarterFinals;
  }

  get rightBracketQuarterFinals(): KnockoutMatch[] {
    return this.knockoutStageService.rightBracketQuarterFinals;
  }

  get leftBracketSemiFinal(): KnockoutMatch | null {
    return this.knockoutStageService.leftBracketSemiFinal;
  }

  get rightBracketSemiFinal(): KnockoutMatch | null {
    return this.knockoutStageService.rightBracketSemiFinal;
  }

  get thirdPlaceMatch(): KnockoutMatch | null {
    return this.knockoutStageService.thirdPlaceMatch;
  }

  get finalMatch(): KnockoutMatch | null {
    return this.knockoutStageService.finalMatch;
  }

  get champion(): Team | null {
    if (this.finalMatch?.played && this.finalMatch.winner) {
      return this.finalMatch.winner === this.finalMatch.teamA.name ? 
             this.finalMatch.teamA : this.finalMatch.teamB;
    }
    return null;
  }

  ngOnInit(): void {
    try {
      // Scroll to top when component initializes
      window.scrollTo(0, 0);

      // Initialize knockout stage through service
      const initialState = this.knockoutStageService.initializeKnockoutStage();
      
      // Set initial round completion status
      const status = initialState.roundCompletionStatus;
      this.roundOf16Simulated = status.roundOf16Simulated;
      this.quarterFinalsSimulated = status.quarterFinalsSimulated;
      this.semiFinalsSimulated = status.semiFinalsSimulated;
      this.finalSimulated = status.finalSimulated;
      this.allMatchesSimulated = status.allMatchesSimulated;

      // Check initial round completion status from service
      this.updateRoundCompletionFromService();
    } catch (error) {
      console.error('Error initializing knockout stage:', error);
      // Could navigate back to group stage or show error message
    }
  }

  simulateMatch(match: KnockoutMatch) {
    try {
      this.knockoutStageService.simulateMatch(match);

      // Check if any rounds have been completed through individual match simulation
      this.updateRoundCompletionFromService();
    } catch (error) {
      console.error('Error simulating knockout match:', error);
      // Reset match state on error
      match.played = false;
      match.winner = '';
    }
  }

  onSimulationModeChanged(mode: SimulationMode): void {
    console.log('Simulation mode changed to:', mode);
    // The mode is automatically updated in the service, no additional action needed
  }

  runAllRoundOf16() {
    if (this.roundOf16Simulated) return;

    try {
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
      this.roundOf16Simulated = true;
    } catch (error) {
      console.error('Error running Round of 16:', error);
      // Reset simulation status on error
      this.roundOf16Simulated = false;
    }
  }
  
  runQuarterFinals() {
    if (this.quarterFinalsSimulated || !this.areAllRoundOf16MatchesPlayed()) return;

    try {
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
      this.quarterFinalsSimulated = true;
    } catch (error) {
      console.error('Error running Quarter Finals:', error);
      this.quarterFinalsSimulated = false;
    }
  }

  runSemiFinals() {
    if (this.semiFinalsSimulated || !this.areAllQuarterFinalMatchesPlayed()) return;

    try {
      if (this.leftBracketSemiFinal && !this.leftBracketSemiFinal.played) {
        this.simulateMatch(this.leftBracketSemiFinal);
      }
      if (this.rightBracketSemiFinal && !this.rightBracketSemiFinal.played) {
        this.simulateMatch(this.rightBracketSemiFinal);
      }
      this.knockoutStageService.checkAndAdvanceToFinals();
      this.semiFinalsSimulated = true;
    } catch (error) {
      console.error('Error running Semi Finals:', error);
      this.semiFinalsSimulated = false;
    }
  }

  runThirdPlace() {
    if (this.thirdPlaceSimulated || !this.areAllSemiFinalMatchesPlayed()) return;

    try {
      if (this.thirdPlaceMatch && !this.thirdPlaceMatch.played) {
        this.simulateMatch(this.thirdPlaceMatch);
      }
      this.thirdPlaceSimulated = true;
    } catch (error) {
      console.error('Error running Third Place match:', error);
      this.thirdPlaceSimulated = false;
    }
  }

  runFinal() {
    if (this.finalSimulated || !this.areAllSemiFinalMatchesPlayed() || !this.thirdPlaceSimulated) return;

    try {
      if (this.finalMatch && !this.finalMatch.played) {
        this.simulateMatch(this.finalMatch);
      }
      this.finalSimulated = true;
    } catch (error) {
      console.error('Error running Final:', error);
      this.finalSimulated = false;
    }
  }

  // Simulate all matches in the knockout stage
  runAllMatches() {
    if (this.allMatchesSimulated) return;

    try {
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

      if (this.leftBracketSemiFinal && !this.leftBracketSemiFinal.played) {
        this.simulateMatch(this.leftBracketSemiFinal);
      }
      if (this.rightBracketSemiFinal && !this.rightBracketSemiFinal.played) {
        this.simulateMatch(this.rightBracketSemiFinal);
      }
      this.knockoutStageService.checkAndAdvanceToFinals();

      // Simulate third place match
      if (this.thirdPlaceMatch && !this.thirdPlaceMatch.played) {
        this.simulateMatch(this.thirdPlaceMatch);
      }

      // Only simulate final after third place is complete
      if (this.finalMatch && !this.finalMatch.played && this.thirdPlaceMatch?.played) {
        this.simulateMatch(this.finalMatch);
      }

      // Set all flags to true when all matches are simulated
      this.allMatchesSimulated = true;
      this.roundOf16Simulated = true;
      this.quarterFinalsSimulated = true;
      this.semiFinalsSimulated = true;
      this.thirdPlaceSimulated = true;
      this.finalSimulated = true;
    } catch (error) {
      console.error('Error running all knockout matches:', error);
      // Reset simulation status on error
      this.allMatchesSimulated = false;
    }
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
    return this.areAllSemiFinalMatchesPlayed() && this.thirdPlaceSimulated && !this.finalSimulated;
  }

  canSimulateThirdPlace(): boolean {
    return this.areAllSemiFinalMatchesPlayed() && !this.thirdPlaceSimulated;
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

  isThirdPlaceMatchPlayed(): boolean {
    return this.thirdPlaceMatch?.played || false;
  }

  private updateRoundCompletionFromService(): void { 
    try {
      // Check the service for round completion status
      const result = this.knockoutStageService.updateRoundCompletionStatus({
        roundOf16Simulated: this.roundOf16Simulated,
        quarterFinalsSimulated: this.quarterFinalsSimulated,
        semiFinalsSimulated: this.semiFinalsSimulated,
        thirdPlaceSimulated: this.thirdPlaceSimulated,
        finalSimulated: this.finalSimulated,
        allMatchesSimulated: this.allMatchesSimulated
      });

      if (result.shouldUpdateState) {
        // Update component state flags based on service response
        if (result.updates.roundOf16Simulated !== undefined) {
          this.roundOf16Simulated = result.updates.roundOf16Simulated;
        }

        if (result.updates.quarterFinalsSimulated !== undefined) {
          this.quarterFinalsSimulated = result.updates.quarterFinalsSimulated;
        }

        if (result.updates.semiFinalsSimulated !== undefined) {
          this.semiFinalsSimulated = result.updates.semiFinalsSimulated;
        }

        if (result.updates.thirdPlaceSimulated !== undefined) {
          this.thirdPlaceSimulated = result.updates.thirdPlaceSimulated;
        }

        if (result.updates.finalSimulated !== undefined) {
          this.finalSimulated = result.updates.finalSimulated;
        }

        if (result.updates.allMatchesSimulated !== undefined) {
          this.allMatchesSimulated = result.updates.allMatchesSimulated;
        }
      }
    } catch (error) {
      console.error('Error updating round completion from service:', error);
    }
  }

  ngOnDestroy(): void {
    try {
      // Cleanup through service
      this.knockoutStageService.cleanupKnockoutStage();

      // Reset simulation tracking flags
      this.roundOf16Simulated = false;
      this.quarterFinalsSimulated = false;
      this.semiFinalsSimulated = false;
      this.thirdPlaceSimulated = false;
      this.finalSimulated = false;
      this.allMatchesSimulated = false;
    } catch (error) {
      console.error('Error during knockout stage cleanup:', error);
    }
  }
}
