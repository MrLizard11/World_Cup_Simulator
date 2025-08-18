import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mode-description-info',
  templateUrl: './mode-description.component.html',
  styleUrls: ['./mode-description.component.css']
})
export class ModeDescriptionInfoComponent {
  @Input() description: string = '';
}
