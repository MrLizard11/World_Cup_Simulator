import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamSelectionComponent } from './team-selection/team-selection.component';
import { AddTeamFormComponent } from './team-selection/add-team-form/add-team-form.component';
import { GroupStageComponent } from './group-stage/group-stage.component';
import { KnockoutStageComponent } from './knockout-stage/knockout-stage.component';
import { SummaryPageComponent } from './summary-page/summary-page.component';
import { KnockoutColumnComponent } from './knockout-stage/knockout-column/knockout-column.component';
import { MatchDetailsComponent } from './knockout-stage/knockout-column/match-details/match-details.component';
import { KnockoutRoundButtonsComponent } from './knockout-stage/knockout-round-buttons/knockout-round-buttons.component';
import { WinnerAnnouncmentComponent } from './knockout-stage/winner-announcment/winner-announcment.component';
import { GroupStageButtonsComponent } from './group-stage/group-stage-buttons/group-stage-buttons.component';
import { GroupStageMatchesComponent } from './group-stage/group-stage-matches/group-stage-matches.component';
import { GroupStageStandingsComponent } from './group-stage/group-stage-standings/group-stage-standings.component';
import { TournamentHeaderComponent } from './summary-page/tournament-header/tournament-header.component';
import { TournamentStatsComponent } from './summary-page/tournament-stats/tournament-stats.component';
import { TournamentActionsComponent } from './summary-page/tournament-actions/tournament-actions.component';


@NgModule({
  declarations: [
    AppComponent,
    TeamSelectionComponent,
    AddTeamFormComponent,
    GroupStageComponent,
    KnockoutStageComponent,
    SummaryPageComponent,
    KnockoutColumnComponent,
    MatchDetailsComponent,
    KnockoutRoundButtonsComponent,
    WinnerAnnouncmentComponent,
    GroupStageButtonsComponent,
    GroupStageMatchesComponent,
    GroupStageStandingsComponent,
    TournamentHeaderComponent,
    TournamentStatsComponent,
    TournamentActionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
