import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team } from '../models/team.model';

@Component({
  selector: 'app-add-team-form',
  templateUrl: './add-team-form.component.html',
  styleUrls: ['./add-team-form.component.css']
})
export class AddTeamFormComponent {
  @Output() teamAdded = new EventEmitter<Team>();
  @Output() formClosed = new EventEmitter<void>();
  
  teamForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      elo: ['', [Validators.required, Validators.min(800), Validators.max(2500)]],
      countryCode: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });
  }

  onSubmit() {
    if (this.teamForm.valid) {
      const team: Team = this.teamForm.value;
      this.teamAdded.emit(team); 
      this.teamForm.reset();
    }
  }

  onCancel() {
    this.teamForm.reset();
    this.formClosed.emit();
  }

  // Getter methods for easier template access
  get name() { return this.teamForm.get('name'); }
  get country() { return this.teamForm.get('country'); }
  get elo() { return this.teamForm.get('elo'); }
  get countryCode() { return this.teamForm.get('countryCode'); }
}
export { Team };

