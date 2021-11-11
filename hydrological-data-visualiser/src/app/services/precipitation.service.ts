import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import * as moment from 'moment';
import {HydrologicalDataBase} from '../model/hydrological-data-base';
import {MarkerCreatorService} from './marker-creator.service';
import {DataModelBase} from '../model/data-model-base';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService extends MarkerCreatorService {
  public url = 'https://imgw-mock.herokuapp.com/imgw';
  public precipitationDict: { [key: string]: number } = {};
  public status = false;
  public info: DataModelBase = this.getInfo();

  constructor(private http: HttpClient) {
    super();
  }

  draw(date: Date): void {
    this.getStationsObservable().subscribe(stations => {
      this.putMarkers(
        this.getDistinctLatLongStations(stations),
        this.getDataFromDateAsObservableUsingInstant(date)
      );
    });
  }

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.url}/stations`);
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

  getDistinctLatLongStations(stations: Station[]): Station[] {
    const tab: number[] = [];
    const retVal: Station[] = [];
    stations.forEach(a => {
      const latitude = a.latitude;
      if (latitude) {
        if (!tab.includes(latitude)) {
          tab.push(latitude);
          retVal.push(a);
        }
      }
    });
    return retVal;
  }


  mapObservableToArrayData(observable: Observable<PrecipitationDayDataNew[]>): HydrologicalDataBase[] {
    const precipitationList: HydrologicalDataBase[] = [];
    observable.subscribe(data => {
      data.forEach(a => {
        this.put(a.stationId, a.date.toString(), a.value); // idk if it is still necessary
        precipitationList.push(this.toBase(a));
      });
    });

    return precipitationList;
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data?instant=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data?dateInstant=${formattedDate}`);
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

  getInfo(): DataModelBase {
    let res!: DataModelBase;
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => res = info);
    return res;
  }

  clear(): void {
    this.group.clearLayers();
  }
}
