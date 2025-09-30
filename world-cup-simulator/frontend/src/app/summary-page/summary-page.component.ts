import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { Router } from '@angular/router';
import { TournamentStateService, TournamentState } from './tournament-state.service';
import { TournamentStatisticsService } from './tournament-statistics.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TournamentStats, TeamPerformance, ChampionJourney } from '../models/tournament-stats';

@Component({
  selector: 'app-summary-page',
  templateUrl: './summary-page.component.html',
  styleUrls: ['./summary-page.component.css']
})
export class SummaryPageComponent implements OnInit, OnDestroy {

  tournamentState: TournamentState | null = null;
  private readonly destroyRef = inject(DestroyRef);

  champion: Team | null = null;
  runnerUp: Team | null = null;
  semiFinalTeams: Team[] = [];
  finalMatch: KnockoutMatch | null = null;
  
  tournamentStats: TournamentStats = {
    totalGoals: 0,
    averageGoalsPerMatch: 0,
    biggestWin: { match: '', score: '', difference: 0 },
    penaltyShootouts: 0,
    mostGoalsInMatch: { match: '', goals: 0 }
  };

  topPerformers: {
    champion: TeamPerformance | null;
    runnerUp: TeamPerformance | null;
    semifinalists: TeamPerformance[];
  } = {
    champion: null,
    runnerUp: null,
    semifinalists: []
  };

  allMatches: KnockoutMatch[] = [];
  isDataAvailable: boolean = false;
  championJourney: ChampionJourney | null = null;

  constructor(
    private tournamentStateService: TournamentStateService,
    private tournamentStatisticsService: TournamentStatisticsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tournamentStateService.getTournamentState()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.tournamentState = state;
        this.updateDisplayData();
      });
  }

  ngOnDestroy(): void {
    // takeUntilDestroyed handles unsubscription automatically
  }

  updateDisplayData(): void {
    if (!this.tournamentState || !this.tournamentState.isTournamentComplete) {
      this.isDataAvailable = false;
      return;
    }

    this.isDataAvailable = true;
    this.champion = this.tournamentState.champion;
    this.runnerUp = this.tournamentState.runnerUp;
    this.semiFinalTeams = this.tournamentState.semiFinalTeams;
    this.finalMatch = this.tournamentState.finalMatch;
    
    this.loadTournamentStats();
    this.loadTopPerformers();
    this.calculateChampionJourney();
  }

  loadTournamentStats(): void {
    if (!this.tournamentState) return;

    this.tournamentStats = this.tournamentStatisticsService.calculateTournamentStats(this.tournamentState);
  }

  loadTopPerformers(): void {
    this.topPerformers = this.tournamentStatisticsService.calculateTopPerformers(
      this.champion,
      this.runnerUp,
      this.semiFinalTeams
    );
  }

  calculateChampionJourney(): void {
    if (!this.champion || !this.tournamentState) {
      this.championJourney = null;
      return;
    }

    this.championJourney = this.tournamentStatisticsService.calculateChampionJourney(
      this.champion,
      this.tournamentState
    );
  }

  restartTournament(): void {
    // Reset tournament state
    this.tournamentStateService.resetTournament();
    
    // Navigate back to team selection
    this.router.navigate(['/team-selection']);
  }

  goToKnockouts(): void {
    this.router.navigate(['/knockout-stage']);
  }

  goToGroupStage(): void {
    this.router.navigate(['/group-stage']);
  }
}
