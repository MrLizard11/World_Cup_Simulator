import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnerAnnouncmentComponent } from './winner-announcment.component';

describe('WinnerAnnouncmentComponent', () => {
  let component: WinnerAnnouncmentComponent;
  let fixture: ComponentFixture<WinnerAnnouncmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WinnerAnnouncmentComponent]
    });
    fixture = TestBed.createComponent(WinnerAnnouncmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
