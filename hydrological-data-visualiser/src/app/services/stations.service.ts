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

    function getDistinctLatLongStations(stations: Station[]): Station[] {
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

    this.http.get(this.stationFilePath, options)
      .subscribe((res) => {
          const enc = new TextDecoder('utf-8');
          // const dupa = getDistinctLatLong(enc.decode(res).split('\n'))
          const stations = enc.decode(res).split('\n').map(elem => {
            let latitude: number | undefined;
            let longitude: number | undefined;
            let name = '';
            let id = 0;
            let geoId = 0;
            if (elem.split(',')[0]) {
              id = parseInt(elem.split(',')[0], 10);
            }
            if (elem.split(',')[1]) {
              name = this.capitalize(elem.split(',')[1]);
            }
            if (elem.split(',')[2]) {
              geoId = parseInt(elem.split(',')[2], 10);
            }
            if (elem.split(',')[3]) {
              latitude = parseFloat(elem.split(',')[3]);
            }
            if (elem.split(',')[4]) {
              longitude = parseFloat(elem.split(',')[4]);
            }
            return new Station(id, name, geoId, latitude, longitude);
          }).filter(a => {
            return a.id !== 0 || a.name === '' || a.geoId !== 0;
          });

          const distinctStations = getDistinctLatLongStations(stations);
          distinctStations.forEach(e => {
            if (e) {
              this.stations.next(e);
              this.createMarker(e);
            }
          });
        }
      );
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
