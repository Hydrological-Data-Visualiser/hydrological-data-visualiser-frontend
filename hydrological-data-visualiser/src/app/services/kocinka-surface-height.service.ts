import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import {MarkerCreatorService} from './marker-creator.service';

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

  draw(date: string): void {
    this.putMarkers(this.status, this.getStations(), this.getData(), date);
  }
}
