import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-knockout-round-buttons',
  templateUrl: './knockout-round-buttons.component.html',
  styleUrls: ['./knockout-round-buttons.component.css']
})
export class KnockoutRoundButtonsComponent {

  @Input() allMatchesSimulated: boolean = false;
  @Input() finalSimulated: boolean = false;
  @Input() thirdPlaceSimulated: boolean = false;
  @Input() semiFinalsSimulated: boolean = false;
  @Input() quarterFinalsSimulated: boolean = false;
  @Input() roundOf16Simulated: boolean = false;
  @Input() canSimulateAllMatches: boolean = false;
  @Input() canSimulateFinal: boolean = false;
  @Input() canSimulateThirdPlace: boolean = false;
  @Input() canSimulateSemiFinals: boolean = false;
  @Input() canSimulateQuarterFinals: boolean = false;
  @Input() canSimulateRoundOf16: boolean = false;
  @Input() areAllSemiFinalMatchesPlayed: boolean = false;
  @Input() areAllQuarterFinalMatchesPlayed: boolean = false;
  @Input() areAllRoundOf16MatchesPlayed: boolean = false;
  @Input() isThirdPlaceMatchPlayed: boolean = false;

  @Output() runAllMatches = new EventEmitter<void>();
  @Output() runFinal = new EventEmitter<void>();
  @Output() runThirdPlace = new EventEmitter<void>();
  @Output() runSemiFinals = new EventEmitter<void>();
  @Output() runQuarterFinals = new EventEmitter<void>();
  @Output() runAllRoundOf16 = new EventEmitter<void>();

  
  onRunAllMatches() {
    this.runAllMatches.emit();
  }

  onRunFinal() {
    this.runFinal.emit();
  }

  onRunThirdPlace() {
    this.runThirdPlace.emit();
  }

  onRunSemiFinals() {
    this.runSemiFinals.emit();
  }

  onRunQuarterFinals() {
    this.runQuarterFinals.emit();
  }

  onRunAllRoundOf16() {
    this.runAllRoundOf16.emit();
  }
}
