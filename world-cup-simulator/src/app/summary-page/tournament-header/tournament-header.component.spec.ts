import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentHeaderComponent } from './tournament-header.component';

describe('TournamentHeaderComponent', () => {
  let component: TournamentHeaderComponent;
  let fixture: ComponentFixture<TournamentHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentHeaderComponent]
    });
    fixture = TestBed.createComponent(TournamentHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
