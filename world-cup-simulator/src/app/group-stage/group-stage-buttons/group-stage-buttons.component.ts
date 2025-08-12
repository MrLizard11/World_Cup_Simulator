import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-group-stage-buttons',
  templateUrl: './group-stage-buttons.component.html',
  styleUrls: ['./group-stage-buttons.component.css']
})
export class GroupStageButtonsComponent {

  @Input() showMatches: boolean = true;
  @Input() showGroupStandings: boolean = false;

  @Output() simulateAllMatches = new EventEmitter<void>();
  @Output() toggleMatches = new EventEmitter<boolean>();
  @Output() toggleStandings = new EventEmitter<boolean>();

  onSimulateAllMatches(): void {
    this.simulateAllMatches.emit();
  }

  onToggleMatches(): void {
    const newValue = !this.showMatches;
    this.toggleMatches.emit(newValue);
  }

  onToggleStandings(): void {
    const newValue = !this.showGroupStandings;
    this.toggleStandings.emit(newValue);
  }
}
