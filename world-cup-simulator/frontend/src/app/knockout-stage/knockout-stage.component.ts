import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { KnockoutStageService } from './knockout-stage.service';
import { SimulationMode } from '../shared/services/simulation-mode.service';
import { Observable, forkJoin, of, EMPTY } from 'rxjs';
import { switchMap, tap, take, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef);

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
    // Scroll to top when component initializes
    window.scrollTo(0, 0);

    const initialState = this.knockoutStageService.initializeKnockoutStage();
    const status = initialState.roundCompletionStatus;
    this.roundOf16Simulated = status.roundOf16Simulated;
    this.quarterFinalsSimulated = status.quarterFinalsSimulated;
    this.semiFinalsSimulated = status.semiFinalsSimulated;
    this.finalSimulated = status.finalSimulated;
    this.allMatchesSimulated = status.allMatchesSimulated;

    this.updateRoundCompletionFromService();
  }

  simulateMatch(match: KnockoutMatch) {
    this.knockoutStageService
      .simulateMatch(match)
      .pipe(
        take(1),
        catchError(() => {
          // Reset match state on error and return EMPTY to stop the stream
          match.played = false;
          match.winner = '';
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.updateRoundCompletionFromService());
  }

  onSimulationModeChanged(mode: SimulationMode): void {
    // The mode is automatically updated in the service
  }

  runAllRoundOf16() {
    if (this.roundOf16Simulated) return;

    const roundOf16Matches = [
      ...this.leftBracketRoundOf16.filter(match => !match.played),
      ...this.rightBracketRoundOf16.filter(match => !match.played)
    ];

    this.simulateMatchesInParallel(roundOf16Matches)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error running Round of 16:', error);
          this.roundOf16Simulated = false;
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.knockoutStageService.checkAndAdvanceToQuarterFinals();
        this.roundOf16Simulated = true;
        this.updateRoundCompletionFromService();
      });
  }

  runQuarterFinals() {
    if (this.quarterFinalsSimulated || !this.areAllRoundOf16MatchesPlayed()) return;

    const quarterFinalMatches = [
      ...this.leftBracketQuarterFinals.filter(match => !match.played),
      ...this.rightBracketQuarterFinals.filter(match => !match.played)
    ];

    this.simulateMatchesInParallel(quarterFinalMatches)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error running Quarter Finals:', error);
          this.quarterFinalsSimulated = false;
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.knockoutStageService.checkAndAdvanceToSemiFinals();
        this.quarterFinalsSimulated = true;
        this.updateRoundCompletionFromService();
      });
  }

  runSemiFinals() {
    if (this.semiFinalsSimulated || !this.areAllQuarterFinalMatchesPlayed()) return;

    const semiFinalMatches = [
      this.leftBracketSemiFinal,
      this.rightBracketSemiFinal
    ].filter(match => match && !match.played) as KnockoutMatch[];

    this.simulateMatchesInParallel(semiFinalMatches)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error running Semi Finals:', error);
          this.semiFinalsSimulated = false;
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.knockoutStageService.checkAndAdvanceToFinals();
        this.semiFinalsSimulated = true;
        this.updateRoundCompletionFromService();
      });
  }

  runThirdPlace() {
    if (this.thirdPlaceSimulated || !this.areAllSemiFinalMatchesPlayed()) return;

    if (this.thirdPlaceMatch && !this.thirdPlaceMatch.played) {
      this.knockoutStageService
        .simulateMatch(this.thirdPlaceMatch)
        .pipe(
          take(1),
          catchError((error) => {
            console.error('Error running Third Place match:', error);
            this.thirdPlaceSimulated = false;
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.thirdPlaceSimulated = true;
          this.updateRoundCompletionFromService();
        });
    }
  }

  runFinal() {
    if (this.finalSimulated || !this.areAllSemiFinalMatchesPlayed() || !this.thirdPlaceSimulated) return;

    if (this.finalMatch && !this.finalMatch.played) {
      this.knockoutStageService
        .simulateMatch(this.finalMatch)
        .pipe(
          take(1),
          catchError((error) => {
            console.error('Error running Final:', error);
            this.finalSimulated = false;
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.finalSimulated = true;
          this.updateRoundCompletionFromService();
        });
    }
  }

  // Simulate all matches in the knockout stage
  runAllMatches() {
    if (this.allMatchesSimulated) return;

    // Simulate Round of 16 matches
    const roundOf16Matches = [
      ...this.leftBracketRoundOf16.filter(match => !match.played),
      ...this.rightBracketRoundOf16.filter(match => !match.played)
    ];

    // Compose the full sequence: Round of 16 -> Quarter Finals -> Semi Finals -> Final/Third-place
    const composed$ = this.simulateMatchesInParallel(roundOf16Matches)
      .pipe(
        tap(() => {
          this.knockoutStageService.checkAndAdvanceToQuarterFinals();
          this.roundOf16Simulated = true;
        }),
        switchMap(() => {
          // Simulate Quarter Finals matches
          const quarterFinalMatches = [
            ...this.leftBracketQuarterFinals.filter(match => !match.played),
            ...this.rightBracketQuarterFinals.filter(match => !match.played)
          ];
          return this.simulateMatchesInParallel(quarterFinalMatches);
        }),
        tap(() => {
          this.knockoutStageService.checkAndAdvanceToSemiFinals();
          this.quarterFinalsSimulated = true;
        }),
        switchMap(() => {
          // Simulate Semi Finals matches
          const semiFinalMatches = [
            this.leftBracketSemiFinal,
            this.rightBracketSemiFinal
          ].filter(match => match && !match.played) as KnockoutMatch[];
          return this.simulateMatchesInParallel(semiFinalMatches);
        }),
        tap(() => {
          this.knockoutStageService.checkAndAdvanceToFinals();
          this.semiFinalsSimulated = true;
        }),
        switchMap(() => {
          // Simulate third place match and final
          const finalMatches = [];
          if (this.thirdPlaceMatch && !this.thirdPlaceMatch.played) {
            finalMatches.push(this.thirdPlaceMatch);
          }
          if (this.finalMatch && !this.finalMatch.played) {
            finalMatches.push(this.finalMatch);
          }
          return this.simulateMatchesInParallel(finalMatches);
        }),
        catchError((error) => {
          console.error('Error running all knockout matches:', error);
          this.allMatchesSimulated = false;
          return EMPTY;
        }),
        take(1)
      );

    // Subscribe to the composed observable so the whole sequence runs
    composed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.allMatchesSimulated = true;
        this.thirdPlaceSimulated = true;
        this.finalSimulated = true;
        this.updateRoundCompletionFromService();
      });
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

  // Helper method to simulate multiple matches in parallel
  private simulateMatchesInParallel(matches: KnockoutMatch[]): Observable<void[]> {
    if (matches.length === 0) {
      return of([]);
    }

    const simulationObservables = matches.map(match => 
      this.knockoutStageService.simulateMatch(match)
    );

    return forkJoin(simulationObservables);
  }
}
