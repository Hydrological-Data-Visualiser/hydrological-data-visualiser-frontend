import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import {MarkerCreatorService} from './marker-creator.service';
import {PrecipitationService} from './precipitation.service';
import {HydrologicalDataBase} from '../model/hydrological-data-base';
import {delay} from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class KocinkaSurfaceHeightService extends MarkerCreatorService{
  public status = false;

  constructor(private http: HttpClient) {
    super();
  }

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>(`https://imgw-mock.herokuapp.com/kocinkaPressure/stations`);
  }

  getStations(): Station[] {
    const stat: Station[] = [];
    this.getStationsObservable().subscribe(data => {
      this.stations$.subscribe(value => {
        stat.push(value);
      });
      data.forEach(value => {
        this.stations.next(new Station(
          value.id,
          value.name.charAt(0).toUpperCase() + value.name.slice(1).toLowerCase(),
          value.geoId,
          value.latitude,
          value.longitude
        ));
      });
    });
    return stat;
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`https://imgw-mock.herokuapp.com/kocinkaPressure/data`);
  }

  getDataFromSpecificDate(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<PrecipitationDayDataNew[]>
    (`https://imgw-mock.herokuapp.com/kocinkaPressure/data?date=${formattedDate}`);
  }

  mapObservableToArrayData(observable: Observable<PrecipitationDayDataNew[]>): HydrologicalDataBase[] {
    const precipitationList: HydrologicalDataBase[] = [];
    let complete = false;
    observable.subscribe(data => {
      data.forEach(a => {
        precipitationList.push(this.toBase(a));
      });
      complete = true;
    });
    while (!complete) { delay(100); }
    return precipitationList;
  }

  toBase(data: PrecipitationDayDataNew): HydrologicalDataBase {
    return new HydrologicalDataBase(
      data.id,
      data.stationId,
      data.date,
      data.dailyPrecipitation
    );
  }

  draw(date: string): void {
    this.putMarkers(
      this.status,
      this.getStations(),
      this.getData(),
      date);
  }
}
