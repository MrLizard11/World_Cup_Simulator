import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TournamentState } from '../tournament-state.service';

@Component({
  selector: 'app-tournament-actions',
  templateUrl: './tournament-actions.component.html',
  styleUrls: ['./tournament-actions.component.css']
})
export class TournamentActionsComponent {
  @Input() isDataAvailable: boolean = false;
  @Input() tournamentState: TournamentState | null = null;
  
  @Output() restartTournament = new EventEmitter<void>();
  @Output() goToKnockouts = new EventEmitter<void>();
  @Output() goToGroupStage = new EventEmitter<void>();

  onRestartTournament(): void {
    this.restartTournament.emit();
  }

  onGoToKnockouts(): void {
    this.goToKnockouts.emit();
  }

  onGoToGroupStage(): void {
    this.goToGroupStage.emit();
  }
}
