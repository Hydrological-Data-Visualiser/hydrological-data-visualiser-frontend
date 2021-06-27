import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Station} from '../model/Station';
import * as L from 'leaflet';
import {Subject} from 'rxjs';
import 'leaflet.markercluster';

@Injectable({
  providedIn: 'root'
})
export class StationsService {
  private stationFilePath = '/assets/data/test.csv';
  public map: any;
  private clickedMarker = new Subject<Station>();
  public clickedMarker$ = this.clickedMarker.asObservable();
  public group = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
  });
  private stations = new Subject<Station>();
  public stations$ = this.stations.asObservable();

  constructor(private http: HttpClient) {
    this.getDataRecordsArrayFromCSVFile();
  }

  redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });


  getDataRecordsArrayFromCSVFile(): void {
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
    this.http.get(this.stationFilePath, options)
      .subscribe((res) => {
        const enc = new TextDecoder('utf-8');

        (enc.decode(res).split('\n').forEach(e => {
          let latitude: number | undefined;
          let longitude: number | undefined;
          let name: string | undefined;
          let id: number | undefined;
          let geoId: number | undefined;
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
            const station = new Station(id, name, geoId, latitude, longitude);
            this.stations.next(station);
            this.createMarker(station);
          }
        }));
      });
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  createMarker(station: Station): void {
    if (station.longitude && station.latitude) {
      const marker = L.marker(new L.LatLng(station.latitude, station.longitude), {icon: this.redIcon}).on('click', event => {
        this.clickedMarker.next(station);
      }).bindPopup(station.name);
      this.group.addLayer(marker);
      this.map.addLayer(this.group);
    }
  }
}
