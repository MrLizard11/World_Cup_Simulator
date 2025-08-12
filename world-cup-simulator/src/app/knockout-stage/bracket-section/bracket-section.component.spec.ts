import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BracketSectionComponent } from './bracket-section.component';

describe('BracketSectionComponent', () => {
  let component: BracketSectionComponent;
  let fixture: ComponentFixture<BracketSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BracketSectionComponent]
    });
    fixture = TestBed.createComponent(BracketSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
