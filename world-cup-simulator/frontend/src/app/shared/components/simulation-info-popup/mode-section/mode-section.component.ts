import { Component, Input } from '@angular/core';
import { SimulationMode } from '../../../services/simulation-mode.service';

@Component({
  selector: 'app-mode-section',
  templateUrl: './mode-section.component.html',
  styleUrls: ['./mode-section.component.css']
})
export class ModeSectionComponent {
  @Input() mode: any;
  @Input() currentMode!: SimulationMode;
  @Input() isActive: boolean = false;
}
