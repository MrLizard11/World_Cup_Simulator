import { Component, Input } from '@angular/core';
import { KnockoutMatch } from '../../models/knockouts.model';

@Component({
  selector: 'app-winner-announcment',
  templateUrl: './winner-announcment.component.html',
  styleUrls: ['./winner-announcment.component.css']
})
export class WinnerAnnouncmentComponent {

  @Input() finalMatch: KnockoutMatch | null = null;
}
