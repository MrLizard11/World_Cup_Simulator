import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team } from '../models';
import { KnockoutMatch } from '../models/knockouts.model';
import { Router } from '@angular/router';
import { TournamentStateService, TournamentState } from './tournament-state.service';
import { Subscription } from 'rxjs';

interface TournamentStats {
  totalGoals: number;
  averageGoalsPerMatch: number;
  biggestWin: { match: string; score: string; difference: number };
  penaltyShootouts: number;
  mostGoalsInMatch: { match: string; goals: number };
}

interface TeamPerformance {
  team: Team;
  finalPosition: string;
  matchesPlayed: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  path: string[];
}

interface ChampionJourneyMatch {
  round: string;
  opponent: Team;
  score: string;
  result: 'win' | 'penalties';
  goalsFor: number;
  goalsAgainst: number;
}

interface ChampionJourney {
  team: Team;
  matches: ChampionJourneyMatch[];
  totalGoals: number;
  totalGoalsConceded: number;
  penaltyWins: number;
}

@Component({
  selector: 'app-summary-page',
  templateUrl: './summary-page.component.html',
  styleUrls: ['./summary-page.component.css']
})
export class SummaryPageComponent implements OnInit, OnDestroy {

  tournamentState: TournamentState | null = null;
  private subscription: Subscription = new Subscription();

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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscription.add(
      this.tournamentStateService.getTournamentState().subscribe(state => {
        this.tournamentState = state;
        this.updateDisplayData();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

    this.tournamentStats = {
      totalGoals: this.tournamentState.totalGoals,
      averageGoalsPerMatch: this.tournamentState.totalMatches > 0 ? 
        Math.round((this.tournamentState.totalGoals / this.tournamentState.totalMatches) * 100) / 100 : 0,
      biggestWin: this.tournamentState.biggestWin || { match: '', score: '', difference: 0 },
      penaltyShootouts: this.tournamentState.penaltyShootouts,
      mostGoalsInMatch: this.getMostGoalsInMatch()
    };
  }

  getMostGoalsInMatch(): { match: string; goals: number } {
    if (!this.tournamentState) return { match: '', goals: 0 };
    
    let mostGoals = 0;
    let mostGoalsMatch = '';

    const allMatches = [
      ...this.tournamentState.roundOf16Matches,
      ...this.tournamentState.quarterFinalMatches,
      ...this.tournamentState.semiFinalMatches,
      ...(this.tournamentState.finalMatch ? [this.tournamentState.finalMatch] : [])
    ];

    allMatches.forEach(match => {
      if (match.played && match.scoreA !== undefined && match.scoreB !== undefined) {
        const totalGoals = match.scoreA + match.scoreB;
        if (totalGoals > mostGoals) {
          mostGoals = totalGoals;
          mostGoalsMatch = `${match.teamA.name} vs ${match.teamB.name}`;
        }
      }
    });

    return { match: mostGoalsMatch, goals: mostGoals };
  }

  loadTopPerformers(): void {
    if (this.champion) {
      this.topPerformers.champion = this.createTeamPerformance(this.champion, '1st - Champion');
    }
    if (this.runnerUp) {
      this.topPerformers.runnerUp = this.createTeamPerformance(this.runnerUp, '2nd - Runner-up');
    }
    
    // Get other semifinalists (those who lost in semifinals)
    const otherSemifinalists = this.semiFinalTeams.filter(team => 
      team.name !== this.champion?.name && team.name !== this.runnerUp?.name
    );
    
    this.topPerformers.semifinalists = otherSemifinalists.map(team => 
      this.createTeamPerformance(team, '3rd/4th - Semifinalist')
    );
  }

  calculateChampionJourney(): void {
    if (!this.champion || !this.tournamentState) {
      this.championJourney = null;
      return;
    }

    const matches: ChampionJourneyMatch[] = [];
    let totalGoals = 0;
    let totalGoalsConceded = 0;
    let penaltyWins = 0;

    // Helper function to find champion's matches
    const findChampionMatch = (matchArray: KnockoutMatch[], roundName: string): void => {
      matchArray.forEach(match => {
        if (match.played && (match.teamA.name === this.champion!.name || match.teamB.name === this.champion!.name)) {
          const isTeamA = match.teamA.name === this.champion!.name;
          const opponent = isTeamA ? match.teamB : match.teamA;
          const goalsFor = isTeamA ? (match.scoreA || 0) : (match.scoreB || 0);
          const goalsAgainst = isTeamA ? (match.scoreB || 0) : (match.scoreA || 0);
          
          totalGoals += goalsFor;
          totalGoalsConceded += goalsAgainst;
          
          let result: 'win' | 'penalties' = 'win';
          if (match.wentToPenalties) {
            result = 'penalties';
            penaltyWins++;
          }

          const score = match.wentToPenalties 
            ? `${match.scoreA}-${match.scoreB} (${match.penaltyScoreA || 0}-${match.penaltyScoreB || 0} pens)`
            : `${match.scoreA}-${match.scoreB}`;

          matches.push({
            round: roundName,
            opponent,
            score,
            result,
            goalsFor,
            goalsAgainst
          });
        }
      });
    };

    // Search through all knockout rounds
    findChampionMatch(this.tournamentState.roundOf16Matches, 'Round of 16');
    findChampionMatch(this.tournamentState.quarterFinalMatches, 'Quarter-finals');
    findChampionMatch(this.tournamentState.semiFinalMatches, 'Semi-finals');
    
    if (this.tournamentState.finalMatch) {
      findChampionMatch([this.tournamentState.finalMatch], 'Final');
    }

    this.championJourney = {
      team: this.champion,
      matches,
      totalGoals,
      totalGoalsConceded,
      penaltyWins
    };
  }

  createTeamPerformance(team: Team, position: string): TeamPerformance {
    // This would need more detailed match tracking to be accurate
    return {
      team,
      finalPosition: position,
      matchesPlayed: position.includes('Champion') ? 7 : position.includes('Runner-up') ? 7 : 6,
      goalsScored: Math.floor(Math.random() * 10) + 5, // Placeholder
      goalsConceded: Math.floor(Math.random() * 5) + 2, // Placeholder
      goalDifference: 0,
      path: this.getTeamPath(team, position)
    };
  }

  getTeamPath(team: Team, position: string): string[] {
    const path = ['Group Stage'];
    
    if (position.includes('Champion') || position.includes('Runner-up') || position.includes('Semifinalist')) {
      path.push('Round of 16', 'Quarter-finals', 'Semi-finals');
    }
    
    if (position.includes('Champion') || position.includes('Runner-up')) {
      path.push('Final');
    }
    
    return path;
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
