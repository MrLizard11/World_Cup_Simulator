import { Component, Input } from '@angular/core';
import { Team } from '../../models';

interface TournamentStats {
  totalGoals: number;
  averageGoalsPerMatch: number;
  biggestWin: { match: string; score: string; difference: number };
  penaltyShootouts: number;
  mostGoalsInMatch: { match: string; goals: number };
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
  selector: 'app-tournament-stats',
  templateUrl: './tournament-stats.component.html',
  styleUrls: ['./tournament-stats.component.css']
})
export class TournamentStatsComponent {
  @Input() tournamentStats: TournamentStats = {
    totalGoals: 0,
    averageGoalsPerMatch: 0,
    biggestWin: { match: '', score: '', difference: 0 },
    penaltyShootouts: 0,
    mostGoalsInMatch: { match: '', goals: 0 }
  };
  
  @Input() championJourney: ChampionJourney | null = null;
  @Input() champion: Team | null = null;
}
