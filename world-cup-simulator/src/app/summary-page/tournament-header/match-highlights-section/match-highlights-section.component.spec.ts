import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchHighlightsSectionComponent } from './match-highlights-section.component';

describe('MatchHighlightsSectionComponent', () => {
  let component: MatchHighlightsSectionComponent;
  let fixture: ComponentFixture<MatchHighlightsSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatchHighlightsSectionComponent]
    });
    fixture = TestBed.createComponent(MatchHighlightsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
