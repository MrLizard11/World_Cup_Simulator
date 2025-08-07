import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupStageComponent } from './group-stage/group-stage.component';
import { TeamSelectionComponent } from './team-selection/team-selection.component';
import { KnockoutStageComponent } from './knockout-stage/knockout-stage.component';

const routes: Routes = [
  { path: '', redirectTo: '/team-selection', pathMatch: 'full' },
  { path: 'team-selection', component: TeamSelectionComponent },
  { path: 'group-stage', component: GroupStageComponent },
  { path: 'knockout-stage', component: KnockoutStageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
