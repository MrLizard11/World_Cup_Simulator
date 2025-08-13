import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() icon!: string;
  @Input() value!: string | number;
  @Input() label!: string;
  @Input() colorIndex: number = 1;
}
