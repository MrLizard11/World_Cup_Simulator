import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentStatisticsGridComponent } from './tournament-statistics-grid.component';

describe('TournamentStatisticsGridComponent', () => {
  let component: TournamentStatisticsGridComponent;
  let fixture: ComponentFixture<TournamentStatisticsGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentStatisticsGridComponent]
    });
    fixture = TestBed.createComponent(TournamentStatisticsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
