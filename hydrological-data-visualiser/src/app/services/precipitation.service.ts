import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import {Observable} from 'rxjs';
import {Station} from '../model/station';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService {
  public precipitationDict: { [key: string]: number } = {};
  public status = false;

  constructor(private http: HttpClient) {
  }

  getDataRecordsArrayFromGetRequest(): PrecipitationDayDataNew[] {
    const precipitationList: PrecipitationDayDataNew[] = [];
    this.http.get<PrecipitationDayDataNew[]>('https://imgw-mock.herokuapp.com/imgw/data').subscribe(data => {
      data.forEach(a => {
        this.put(a.stationId, a.date.toString(), a.value);
        precipitationList.push(a);
      });
    });

    return precipitationList;
  }

  getPrecipitationDataForSpecificDateAndStation(date: string, station: Station): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>
        (`https://imgw-mock.herokuapp.com/imgw/data?date=${date}&stationId=${station.id.toString()}`);
  }

  getPrecipitationDataForSpecificDate(date: Date): Observable<PrecipitationDayDataNew[]> {
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
}
