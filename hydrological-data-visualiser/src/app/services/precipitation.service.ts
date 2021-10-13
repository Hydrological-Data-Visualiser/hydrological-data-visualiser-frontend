import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {StationsService} from './stations.service';
import {PreciptationDayDataNew} from '../model/PreciptationDayDataNew';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService {
  private precipitationFilePath = '/assets/data/precipitation.csv';
  public precipitationDict: { [key: string]: number } = {};

  constructor(private http: HttpClient) {
  }

  getDataRecordsArrayFromCSVFile(stationService: StationsService): void {
    const options: {
      headers?: HttpHeaders;
      observe?: 'body';
      params?: HttpParams;
      reportProgress?: boolean;
      responseType: 'arraybuffer';
      withCredentials?: boolean;
    } = {
      responseType: 'arraybuffer'
    };

    this.http.get(this.precipitationFilePath, options)
      .subscribe((res) => {
        const enc = new TextDecoder('utf-8');
        enc.decode(res).split('\n').map(elem => {
          const elemSplit = elem.split(',');
          let name = '';
          let stationId = 0;
          let year = '';
          let month = '';
          let day = '';
          let precipitation = 0;
          if (elemSplit[0]) {
            stationId = parseInt(elemSplit[0], 10);
          }
          if (elemSplit[1]) {
            name = this.capitalize(elemSplit[1]);
          }
          if (elemSplit[2]) {
            year = elemSplit[2];
          }
          if (elemSplit[3]) {
            month = elemSplit[3];
          }
          if (elemSplit[4]) {
            day = elemSplit[4];
          }
          if (elemSplit[5]) {
            precipitation = parseFloat(elemSplit[5]);
          }

          // this.put(stationId, year, month, day, precipitation);
        });
        stationService.getDataRecordsArrayFromGetRequest();
      });
  }

  getDataRecordsArrayFromGetRequest(stationService: StationsService): void {
    stationService.getDataRecordsArrayFromGetRequest();

    this.http.get<PreciptationDayDataNew[]>('https://imgw-mock.herokuapp.com/precipitation').subscribe(data => {
      data.forEach(a => {
        this.put(a.stationId, a.date.toString(), a.dailyPrecipitation);
      });
    });
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
