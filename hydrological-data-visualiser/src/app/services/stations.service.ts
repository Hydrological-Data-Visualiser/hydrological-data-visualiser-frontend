import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Station} from '../model/Station';
import * as L from 'leaflet';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StationsService {
  private stationFilePath = '/assets/data/wykaz_stacji.csv';
  public stationList: Station[] = [];
  public map: any;
  private clickedMarker = new BehaviorSubject<Station | undefined>(undefined);
  public clickedMarker$ = this.clickedMarker.asObservable();

  constructor(private http: HttpClient) {
  }

  redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });


  getDataRecordsArrayFromCSVFile(): Station[] {
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
    const tab: Station[] = [];
    const a = this.http.get(this.stationFilePath, options);
    a.subscribe((res) => {
      const enc = new TextDecoder('utf-8');

      (enc.decode(res).split('\n').forEach(e => {
        let latitude: number | undefined;
        let longitude: number | undefined;
        let name: string | undefined;
        let id: number | undefined;
        let geoId: number | undefined;
        let station: Station | undefined;
        if (e.split(',')[0]) {
          id = parseInt(e.split(',')[0], 10);
        }
        if (e.split(',')[1]) {
          name = this.capitalize(e.split(',')[1]);
        }
        if (e.split(',')[2]) {
          geoId = parseInt(e.split(',')[2], 10);
        }
        if (e.split(',')[3]) {
          latitude = parseFloat(e.split(',')[3]);
        }
        if (e.split(',')[4]) {
          longitude = parseFloat(e.split(',')[4]);
        }
        if (id && name && geoId) {
          station = new Station(id, name, geoId, latitude, longitude);
          tab.push(station);
        }
        if (id && name && geoId && longitude && latitude) {
          L.marker(new L.LatLng(latitude, longitude), {icon: this.redIcon}).addTo(this.map).on('click', event => {
            this.clickedMarker.next(station);
          })
            .bindPopup(name);
        }
      }));
    });
    this.stationList = tab;
    return tab;
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}
