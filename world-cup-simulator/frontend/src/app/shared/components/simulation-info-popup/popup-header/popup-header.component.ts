import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-header',
  templateUrl: './popup-header.component.html',
  styleUrls: ['./popup-header.component.css']
})
export class PopupHeaderComponent {
  @Output() closeRequested = new EventEmitter<void>();

  onClose(): void {
    this.closeRequested.emit();
  }
}
