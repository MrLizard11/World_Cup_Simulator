import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.css']
})
export class SettingsHeaderComponent {
  @Input() isCompact: boolean = false;
  @Output() infoRequested = new EventEmitter<void>();

  onInfoClick(): void {
    this.infoRequested.emit();
  }
}
