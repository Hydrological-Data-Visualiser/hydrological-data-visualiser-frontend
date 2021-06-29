import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { PreciptationDayData } from '../model/PreciptationDayData';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService {

  precipitationFilePath = "precipitation.csv"

  constructor(private http: HttpClient) {
    this.getDataRecordsArrayFromCSVFile();
  }

  getDataRecordsArrayFromCSVFile() {
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
          const stations = enc.decode(res).split('\n').map(elem => {
            let name = ''
            let stationId = 0
            let year = ''
            let month = ''
            let day = ''
            let precipitation = 0;
            if (elem.split(',')[0]) {
              stationId = parseInt(elem.split(',')[0], 10);
            }
            if (elem.split(',')[1]) {
              name = this.capitalize(elem.split(',')[1]);
            }
            if (elem.split(',')[2]) {
              year = elem.split(',')[2];
            }
            if (elem.split(',')[3]) {
              month = elem.split(',')[3];
            }
            if (elem.split(',')[4]) {
              day = elem.split(',')[4];
            }
            if (elem.split(',')[5]) {
              precipitation = parseInt(elem.split(',')[2], 10);
            }
            return new PreciptationDayData(stationId, name, year, month, day, precipitation);
          }).filter(a => {
            return a.stationID !== 0 || a.stationName === ''
          });
        });
  }
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}
