import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionsJourneyHeaderComponent } from './champions-journey-header.component';

describe('ChampionsJourneyHeaderComponent', () => {
  let component: ChampionsJourneyHeaderComponent;
  let fixture: ComponentFixture<ChampionsJourneyHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChampionsJourneyHeaderComponent]
    });
    fixture = TestBed.createComponent(ChampionsJourneyHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
