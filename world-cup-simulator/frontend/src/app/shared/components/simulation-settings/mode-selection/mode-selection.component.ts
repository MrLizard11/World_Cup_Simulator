import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SimulationMode } from '../../../services/simulation-mode.service';

@Component({
  selector: 'app-mode-selection',
  templateUrl: './mode-selection.component.html',
  styleUrls: ['./mode-selection.component.css']
})
export class ModeSelectionComponent {
  @Input() isCompact: boolean = false;
  @Input() selectedMode!: SimulationMode;
  @Input() availableModes: any[] = [];
  @Output() modeChanged = new EventEmitter<SimulationMode>();
  @Output() infoRequested = new EventEmitter<void>();

  onModeChange(newMode: SimulationMode): void {
    this.selectedMode = newMode;
    this.modeChanged.emit(newMode);
  }

  onInfoClick(): void {
    this.infoRequested.emit();
  }
}
