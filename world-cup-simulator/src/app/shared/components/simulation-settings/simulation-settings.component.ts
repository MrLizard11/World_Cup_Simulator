import { Component, Output, EventEmitter, Input } from '@angular/core';
import { SimulationMode, SimulationModeService } from '../../services/simulation-mode.service';

@Component({
  selector: 'app-simulation-settings',
  templateUrl: './simulation-settings.component.html',
  styleUrls: ['./simulation-settings.component.css']
})
export class SimulationSettingsComponent {
  @Input() isCompact: boolean = false;
  @Output() modeChanged = new EventEmitter<SimulationMode>();

  selectedMode: SimulationMode;
  availableModes: any[];
  showPopup: boolean = false;

  constructor(private simulationModeService: SimulationModeService) {
    this.selectedMode = this.simulationModeService.getCurrentMode();
    this.availableModes = this.simulationModeService.getAvailableModes();
    
  }

   onModeChange(newMode: SimulationMode): void {
    this.selectedMode = newMode;
    this.simulationModeService.setSimulationMode(this.selectedMode);
    this.modeChanged.emit(this.selectedMode);
  }

  getCurrentModeDescription(): string {
    return this.simulationModeService.getCurrentModeDescription();
  }

  getCurrentModeName(): string {
    const currentMode = this.availableModes.find(m => m.mode === this.selectedMode);
    return currentMode ? currentMode.name : 'Unknown';
  }

  showInfoPopup(): void {
    this.showPopup = true;
  }

  hideInfoPopup(): void {
    this.showPopup = false;
  }
}
