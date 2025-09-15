import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation-buttons',
  templateUrl: './navigation-buttons.component.html',
  styleUrls: ['./navigation-buttons.component.css']
})
export class NavigationButtonsComponent {
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
