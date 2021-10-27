import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {Subject} from 'rxjs';
import 'leaflet.markercluster';
import {PrecipitationService} from './precipitation.service';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import * as moment from 'moment';

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
    maxClusterRadius: zoom => 130 - zoom * 10
  });
  private stations = new Subject<Station>();
  public stations$ = this.stations.asObservable();
  public stationList: Station[] = [];
  private markers: { [key: number]: L.Marker } = {};

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
    this.http.get<Station[]>('https://imgw-mock.herokuapp.com/imgw/stations').subscribe(data => {
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

  putMarkers(date: string, precipitationService: PrecipitationService): void {
    if (precipitationService.status) {
      this.group.clearLayers();
      const stations = this.getDistinctLatLongStations(this.stationList);
      const usedStations: Station[] = [];
      this.http.get<PrecipitationDayDataNew[]>(`https://imgw-mock.herokuapp.com/imgw/data?date=${date}`).subscribe(data => {
        data.forEach(rainData => {
          const rainValue = rainData.dailyPrecipitation;
          const colorValue = rainValue * 50;
          const filteredStations = stations.filter(station => station.id === rainData.stationId);
          if (filteredStations.length > 0) {
            const station = filteredStations[0];
            usedStations.push(station);
            this.createMarker(station, this.rgbToHex(Math.max(255 - colorValue, 0), Math.max(255 - colorValue, 0), 255), rainValue);
          }
        });
        const unusedStations: Station[] = stations.filter(n => !usedStations.includes(n));
        unusedStations.forEach(station => {
          this.createMarker(station, this.rgbToHex(0, 0, 0), NaN);
        });
      });
    } else {
      this.group.clearLayers();
    }
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
      });
      if (!isNaN(rainValue)) {
        marker.bindPopup(station.name + ' ' + rainValue.toString() + 'mm');
      } else {
        marker.bindPopup(station.name + ' no rain data');
      }
      this.markers[station.id] = marker;
      this.group.addLayer(marker);
      this.map.addLayer(this.group);
    }
  }

  updateMarkers(date: Date): Promise<void> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    const stations = this.getDistinctLatLongStations(this.stationList);
    const usedStations: Station[] = [];
    return this.http.get<PrecipitationDayDataNew[]>
    (`https://imgw-mock.herokuapp.com/imgw/data?date=${formattedDate}`).toPromise().then(data => {
      data.forEach(rainData => {
        const rainValue = rainData.dailyPrecipitation;
        const colorValue = rainValue * 50;
        const filteredStations = stations.filter(station => station.id === rainData.stationId);
        if (filteredStations.length > 0) {
          const station = filteredStations[0];
          // result[0] = filteredStations[0]
          // usedStations.push(station);
          this.updateMarker(station, this.rgbToHex(Math.max(255 - colorValue, 0), Math.max(255 - colorValue, 0), 255), rainValue);
        }
      });
    });
  }

  updateMarker(station: Station, colorHex: string, rainValue: number): void {
    const marker = this.markers[station.id];
    marker.setIcon(this.getColoredIcon(colorHex));
    marker.setPopupContent(station.name + ' ' + rainValue.toString() + 'mm');
  }
}
