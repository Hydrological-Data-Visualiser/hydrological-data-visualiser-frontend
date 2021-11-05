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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StationsComponent} from './components/stations/stations.component';
import {SearchFilterPipe} from './pipes/search-filter.pipe';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CalendarModule} from '@syncfusion/ej2-angular-calendars';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import { GeojsonComponent } from './components/geojson/geojson.component';
import { GeotiffComponent } from './components/geotiff/geotiff.component';
import {MatButtonModule} from '@angular/material/button';
import {SidePanelService} from "./components/side-panel/side-panel-service";
import { LegendComponent } from './components/legend/legend.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavbarComponent,
    DataModelComponent,
    SidePanelComponent,
    StationsComponent,
    SearchFilterPipe,
    GeojsonComponent,
    GeotiffComponent,
    LegendComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        AngularResizedEventModule,
        FormsModule,
        ScrollingModule,
        CalendarModule,
        BrowserAnimationsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatNativeDateModule,
        MatCardModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatRadioModule,
        MatButtonModule,
    ],
  providers: [SidePanelComponent, SidePanelService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
