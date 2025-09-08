import { Component, Input } from '@angular/core';
import { TournamentStats } from '../../../models/tournament-stats';

@Component({
  selector: 'app-tournament-statistics-grid',
  templateUrl: './tournament-statistics-grid.component.html',
  styleUrls: ['./tournament-statistics-grid.component.css']
})
export class TournamentStatisticsGridComponent {
  @Input() tournamentStats!: TournamentStats;
}
