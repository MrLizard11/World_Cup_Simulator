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
import { BracketSectionComponent } from './knockout-stage/bracket-section/bracket-section.component';
import { TournamentProgressComponent } from './summary-page/tournament-progress/tournament-progress.component';
import { NavigationButtonsComponent } from './summary-page/navigation-buttons/navigation-buttons.component';
import { ChampionSectionComponent } from './summary-page/champion-section/champion-section.component';
import { FinalMatchResultsComponent } from './summary-page/final-match-results/final-match-results.component';
import { TopFourStandingsComponent } from './summary-page/top-four-standings/top-four-standings.component';
import { PositionInfoComponent } from './summary-page/position-info/position-info.component';
import { TournamentStatisticsGridComponent } from './summary-page/tournament-header/tournament-statistics-grid/tournament-statistics-grid.component';
import { MatchHighlightsSectionComponent } from './summary-page/tournament-header/match-highlights-section/match-highlights-section.component';
import { ChampionsJourneyHeaderComponent } from './summary-page/tournament-header/champions-journey-header/champions-journey-header.component';
import { JourneyMatchesTimelineComponent } from './summary-page/tournament-header/journey-matches-timeline/journey-matches-timeline.component';
import { JourneySummaryStatsComponent } from './summary-page/tournament-header/journey-summary-stats/journey-summary-stats.component';
import { JourneyMatchCardComponent } from './summary-page/tournament-header/journey-match-card/journey-match-card.component';


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
    BracketSectionComponent,
    TournamentProgressComponent,
    NavigationButtonsComponent,
    ChampionSectionComponent,
    FinalMatchResultsComponent,
    TopFourStandingsComponent,
    PositionInfoComponent,
    TournamentStatisticsGridComponent,
    MatchHighlightsSectionComponent,
    ChampionsJourneyHeaderComponent,
    JourneyMatchesTimelineComponent,
    JourneySummaryStatsComponent,
    JourneyMatchCardComponent,
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
