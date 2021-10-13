import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {Subject} from 'rxjs';
import 'leaflet.markercluster';
import {PrecipitationService} from './precipitation.service';

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
  public stationList: Station[] = [];
  private markers: L.Marker[] = [];

  constructor(private http: HttpClient,
              private precipitationService: PrecipitationService) {
    // Callback used to chain calls
    precipitationService.getDataRecordsArrayFromGetRequest(this);
  }

  redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  getColoredIcon(color: string): L.DivIcon {
    const markerHtmlStyles = `
      background-color: ${color};
      width: 2rem;
      height: 2rem;
      display: block;
      left: -1rem;
      top: -1rem;
      position: relative;
      border-radius: 2rem 2rem 0;
      transform: rotate(45deg);
      border: 2px solid #000000`;

    return L.divIcon({
      iconAnchor: [0, 24],
      popupAnchor: [1, -36],
      shadowSize: [41, 41],
      html: `<span style="${markerHtmlStyles}" />`
    });
  }

  // not used
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
    console.log('In');

    this.http.get(this.stationFilePath, options)
      .subscribe((res) => {
          const enc = new TextDecoder('utf-8');
          this.stationList = enc.decode(res).split('\n').map(elem => {
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
          }).map(e => {
            this.stations.next(e);
            return e;
          });
        }
      );
  }

  getDataRecordsArrayFromGetRequest(): void {
    this.http.get<Station[]>('https://imgw-mock.herokuapp.com/stations').subscribe(data => {
      this.stations$.subscribe(value => {
        this.stationList.push(value);
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

  putMarkers(date: string): void {
    this.group.clearLayers();
    const distinctStations = this.getDistinctLatLongStations(this.stationList);
    distinctStations.forEach(station => {
      if (station) {
        const rainValue = this.precipitationService.get(station.id, date);
        console.log(rainValue);
        const colorValue = rainValue * 50;
        this.createMarker(station, this.rgbToHex(Math.max(255 - colorValue, 0), Math.max(255 - colorValue, 0), 255), rainValue);
      }
    });
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  rgbToHex(r: number, g: number, b: number): string {
    // tslint:disable-next-line:no-bitwise
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  createMarker(station: Station, colorHex: string, rainValue: number): void {
    if (station.longitude && station.latitude) {
      const marker = L.marker(new L.LatLng(station.latitude, station.longitude),
        {icon: this.getColoredIcon(colorHex)}).on('click', event => {
        this.clickedMarker.next(station);
      }).bindPopup(station.name + ' ' + rainValue.toString() + 'mm');
      this.group.addLayer(marker);
      this.map.addLayer(this.group);
    }
  }
}
