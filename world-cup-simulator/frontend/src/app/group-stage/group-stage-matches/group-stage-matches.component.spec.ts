import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupStageMatchesComponent } from './group-stage-matches.component';

describe('GroupStageMatchesComponent', () => {
  let component: GroupStageMatchesComponent;
  let fixture: ComponentFixture<GroupStageMatchesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupStageMatchesComponent]
    });
    fixture = TestBed.createComponent(GroupStageMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
