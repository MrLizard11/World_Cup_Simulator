import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-example-section',
  templateUrl: './example-section.component.html',
  styleUrls: ['./example-section.component.css']
})
export class ExampleSectionComponent {
  @Input() example: any;
}
