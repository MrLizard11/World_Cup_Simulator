import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnockoutColumnComponent } from './knockout-column.component';

describe('KnockoutColumnComponent', () => {
  let component: KnockoutColumnComponent;
  let fixture: ComponentFixture<KnockoutColumnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KnockoutColumnComponent]
    });
    fixture = TestBed.createComponent(KnockoutColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
