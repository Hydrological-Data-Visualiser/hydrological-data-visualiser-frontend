import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Station} from '../model/station';
import * as L from 'leaflet';
import {PrecipitationService} from './precipitation.service';
import {PrecipitationDayDataNew} from '../model/precipitation-day-data-new';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class MarkerCreatorService {
  public map: any;
  private clickedMarker = new Subject<Station>();
  public clickedMarker$ = this.clickedMarker.asObservable();
  public group = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: zoom => 130 - zoom * 10
  });
  public stations = new Subject<Station>();
  public stations$ = this.stations.asObservable();
  public stationList: Station[] = [];
  private markers: { [key: number]: L.Marker } = {};

  constructor() { }

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

  putMarkers(status: boolean, stations: Station[], data: Observable<PrecipitationDayDataNew[]>, date: string): void {
    if (status) {
      this.group.clearLayers();
      const usedStations: Station[] = [];
      data.subscribe(d => {
        d.filter(a => (moment(a.date)).format('YYYY-MM-DD') === date)
          .forEach(rainData => {
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

  updateMarkers(date: Date, stations: Station[], data: Observable<PrecipitationDayDataNew[]>): Promise<void> {
    const usedStations: Station[] = [];
    return data
      .toPromise().then( d => {
        d.forEach(rainData => {
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

  rgbToHex(r: number, g: number, b: number): string {
    // tslint:disable-next-line:no-bitwise
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
