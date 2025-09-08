import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mode-description',
  templateUrl: './mode-description.component.html',
  styleUrls: ['./mode-description.component.css']
})
export class ModeDescriptionComponent {
  @Input() isCompact: boolean = false;
  @Input() description: string = '';
  @Input() modeName: string = '';
}
