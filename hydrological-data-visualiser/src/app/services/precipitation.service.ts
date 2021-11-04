import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import * as moment from 'moment';
import {HydrologicalDataBase} from '../model/hydrological-data-base';
import {MarkerCreatorService} from './marker-creator.service';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService extends MarkerCreatorService{
  public precipitationDict: { [key: string]: number } = {};
  public status = false;

  constructor(private http: HttpClient) {
    super();
  }

  draw(date: string): void {
    this.putMarkers(
      this.status,
      this.getStations(),
      this.getPrecipitationDataForSpecificStringDate(date),
      date);
  }

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>('https://imgw-mock.herokuapp.com/imgw/stations');
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>('https://imgw-mock.herokuapp.com/imgw/data');
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

  mapObservableToArrayData(observable: Observable<PrecipitationDayDataNew[]>): HydrologicalDataBase[] {
    const precipitationList: HydrologicalDataBase[] = [];
    observable.subscribe(data => {
      data.forEach(a => {
        this.put(a.stationId, a.date.toString(), a.dailyPrecipitation); // idk if it is still necessary
        precipitationList.push(this.toBase(a));
      });
    });

    return precipitationList;
  }

  getDataRecordsArrayFromGetRequest(): HydrologicalDataBase[] {
    return this.mapObservableToArrayData(this.getData());
  }

  getPrecipitationDataForSpecificDateAndStation(date: string, station: Station): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>
        (`https://imgw-mock.herokuapp.com/imgw/data?date=${date}&stationId=${station.id.toString()}`);
  }

  getDataFromSpecificDate(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<PrecipitationDayDataNew[]>
    (`https://imgw-mock.herokuapp.com/imgw/data?date=${formattedDate}`);
  }

  getPrecipitationDataForSpecificStringDate(date: string): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`https://imgw-mock.herokuapp.com/imgw/data?date=${date}`);
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  put(stationId: number, date: string, value: number): void {
    const key: string = this.genKey(stationId, date);
    this.precipitationDict[key] = value;
  }

  get(stationId: number, date: string): number {
    const key: string = this.genKey(stationId, date);
    if (key in this.precipitationDict && !isNaN(this.precipitationDict[key])) {
      return this.precipitationDict[key];
    } else {
      return 0;
    }
  }

  genKey(stationId: number, date: string): string {
    // date format YYYY-MM-DD
    return String(stationId) + '|' + date;
  }

  toBase(data: PrecipitationDayDataNew): HydrologicalDataBase {
    return new HydrologicalDataBase(
      data.id,
      data.stationId,
      data.date,
      data.dailyPrecipitation
    );
  }
}
