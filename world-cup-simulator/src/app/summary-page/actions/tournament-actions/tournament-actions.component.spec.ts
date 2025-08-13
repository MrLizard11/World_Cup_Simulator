import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentActionsComponent } from './tournament-actions.component';

describe('TournamentActionsComponent', () => {
  let component: TournamentActionsComponent;
  let fixture: ComponentFixture<TournamentActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentActionsComponent]
    });
    fixture = TestBed.createComponent(TournamentActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
