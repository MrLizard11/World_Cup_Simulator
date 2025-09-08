import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupStageStandingsComponent } from './group-stage-standings.component';

describe('GroupStageStandingsComponent', () => {
  let component: GroupStageStandingsComponent;
  let fixture: ComponentFixture<GroupStageStandingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupStageStandingsComponent]
    });
    fixture = TestBed.createComponent(GroupStageStandingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
