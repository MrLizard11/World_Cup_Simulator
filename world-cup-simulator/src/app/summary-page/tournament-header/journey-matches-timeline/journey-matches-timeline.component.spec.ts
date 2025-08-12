import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyMatchesTimelineComponent } from './journey-matches-timeline.component';

describe('JourneyMatchesTimelineComponent', () => {
  let component: JourneyMatchesTimelineComponent;
  let fixture: ComponentFixture<JourneyMatchesTimelineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JourneyMatchesTimelineComponent]
    });
    fixture = TestBed.createComponent(JourneyMatchesTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
