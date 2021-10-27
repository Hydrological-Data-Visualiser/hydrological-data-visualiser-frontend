import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MapComponent} from './components/map/map.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {DataModelComponent} from './components/data-model/data-model.component';
import {SidePanelComponent} from './components/side-panel/side-panel.component';
import {AngularResizedEventModule} from 'angular-resize-event';
import {FormsModule} from '@angular/forms';
import {StationsComponent} from './components/stations/stations.component';
import {SearchFilterPipe} from './pipes/search-filter.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { CalendarModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavbarComponent,
    DataModelComponent,
    SidePanelComponent,
    StationsComponent,
    SearchFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularResizedEventModule,
    FormsModule,
    ScrollingModule,
    CalendarModule
  ],
  providers: [SidePanelComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
