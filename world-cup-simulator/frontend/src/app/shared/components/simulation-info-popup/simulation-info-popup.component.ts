import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SimulationMode } from '../../services/simulation-mode.service';
import { SIMULATION_MODES_DATA, ModeInfo } from '../../data';

@Component({
  selector: 'app-simulation-info-popup',
  templateUrl: './simulation-info-popup.component.html',
  styleUrls: ['./simulation-info-popup.component.css']
})
export class SimulationInfoPopupComponent {
  @Input() isVisible: boolean = false;
  @Input() currentMode: SimulationMode = SimulationMode.ELO_REALISTIC;
  @Output() closePopup = new EventEmitter<void>();

  modes: ModeInfo[] = SIMULATION_MODES_DATA;

  close(): void {
    this.closePopup.emit();
  }
}
