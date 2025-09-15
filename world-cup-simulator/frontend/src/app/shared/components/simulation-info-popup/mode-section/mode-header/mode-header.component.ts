import { Component, Input } from '@angular/core';
import { SimulationMode } from '../../../../services/simulation-mode.service';

@Component({
  selector: 'app-mode-header',
  templateUrl: './mode-header.component.html',
  styleUrls: ['./mode-header.component.css']
})
export class ModeHeaderComponent {
  @Input() mode: any;
  @Input() currentMode!: SimulationMode;
}
