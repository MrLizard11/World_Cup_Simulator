import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupStageButtonsComponent } from './group-stage-buttons.component';

describe('GroupStageButtonsComponent', () => {
  let component: GroupStageButtonsComponent;
  let fixture: ComponentFixture<GroupStageButtonsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupStageButtonsComponent]
    });
    fixture = TestBed.createComponent(GroupStageButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
