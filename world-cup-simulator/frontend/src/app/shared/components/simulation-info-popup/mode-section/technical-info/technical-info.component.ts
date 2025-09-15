import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-technical-info',
  templateUrl: './technical-info.component.html',
  styleUrls: ['./technical-info.component.css']
})
export class TechnicalInfoComponent {
  @Input() technicalPoints: string[] = [];
}
