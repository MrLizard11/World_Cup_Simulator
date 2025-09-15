import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSelectionComponent } from './team-selection.component';

describe('TeamSelectionComponent', () => {
  let component: TeamSelectionComponent;
  let fixture: ComponentFixture<TeamSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamSelectionComponent]
    });
    fixture = TestBed.createComponent(TeamSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
