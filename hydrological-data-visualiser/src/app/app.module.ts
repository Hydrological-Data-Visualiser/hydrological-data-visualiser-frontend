import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MapComponent} from './components/map/map.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {FormModalComponent} from './components/form-modal/form-modal.component';
import {SidePanelComponent} from './components/side-panel/side-panel.component';
import {AngularResizedEventModule} from 'angular-resize-event';
import {FormsModule} from '@angular/forms';
import {StationsComponent} from './components/stations/stations.component';
import {SearchFilterPipe} from './pipes/search-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavbarComponent,
    FormModalComponent,
    SidePanelComponent,
    StationsComponent,
    SearchFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularResizedEventModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
