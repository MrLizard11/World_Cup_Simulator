import { Component, Input } from '@angular/core';
import { TournamentState } from '../tournament-state.service';

@Component({
  selector: 'app-tournament-progress',
  templateUrl: './tournament-progress.component.html',
  styleUrls: ['./tournament-progress.component.css']
})
export class TournamentProgressComponent {
  @Input() tournamentState: TournamentState | null = null;
}
