import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneySummaryStatsComponent } from './journey-summary-stats.component';

describe('JourneySummaryStatsComponent', () => {
  let component: JourneySummaryStatsComponent;
  let fixture: ComponentFixture<JourneySummaryStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JourneySummaryStatsComponent]
    });
    fixture = TestBed.createComponent(JourneySummaryStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
