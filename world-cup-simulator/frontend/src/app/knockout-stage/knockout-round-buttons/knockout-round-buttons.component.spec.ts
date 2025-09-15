import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnockoutRoundButtonsComponent } from './knockout-round-buttons.component';

describe('KnockoutRoundButtonsComponent', () => {
  let component: KnockoutRoundButtonsComponent;
  let fixture: ComponentFixture<KnockoutRoundButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KnockoutRoundButtonsComponent]
    });
    fixture = TestBed.createComponent(KnockoutRoundButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
