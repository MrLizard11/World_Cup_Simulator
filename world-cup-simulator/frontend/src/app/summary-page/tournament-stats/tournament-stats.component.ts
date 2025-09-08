import { Component, Input } from '@angular/core';
import { Team } from '../../models';
import { TournamentStats, ChampionJourneyMatch, ChampionJourney } from '../../models/tournament-stats';

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
