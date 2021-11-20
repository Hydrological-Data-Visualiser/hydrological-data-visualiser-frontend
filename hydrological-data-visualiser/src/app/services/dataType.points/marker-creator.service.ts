import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Station} from '../../model/station';
import * as L from 'leaflet';
import * as moment from 'moment';
import {HydrologicalDataBase} from '../../model/hydrological-data-base';
import 'leaflet.markercluster';
import {ColorService} from '../color.service';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';

@Injectable({
  providedIn: 'root'
})
export abstract class MarkerCreatorService implements DataServiceInterface<PrecipitationDayDataNew> {
  public url!: string;
  public info!: DataModelBase;
  public map: any;
  public group = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: zoom => 100 - zoom * 10
  });
  public stations = new Subject<Station>();
  public stations$ = this.stations.asObservable();
  public stationList: Station[] = [];
  private clickedMarker = new Subject<Station>();
  public clickedMarker$ = this.clickedMarker.asObservable();
  private markers: { [key: number]: L.Marker } = {};

  protected constructor(protected colorService: ColorService, protected sidePanelService: SidePanelService, public http: HttpClient) {
  }

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

  putMarkers(stations: Station[], data: Observable<HydrologicalDataBase[]>, metricLabel: string, date: Date): void {
    this.group.clearLayers();

    const usedStations: Station[] = [];
    data.subscribe(d => {
      d.forEach(rainData => {
        const rainValue = rainData.value;
        const filteredStations = stations.filter(station => station.id === rainData.stationId);
        if (filteredStations.length > 0) {
          const station = filteredStations[0];
          usedStations.push(station);
          const color = this.colorService.getColor(rainValue);
          this.createMarker(station, this.rgbStringToHex(color), rainValue, metricLabel, date);
        }
      });
      const unusedStations: Station[] = stations.filter(n => !usedStations.includes(n));
      unusedStations.forEach(station => this.createMarker(station, this.rgbToHex(0, 0, 0), NaN, metricLabel, date));
      this.map.fitBounds(this.group.getBounds());
    });
  }

  createMarker(station: Station, colorHex: string, rainValue: number, metricLabel: string, date: Date): void {
    if (station.longitude && station.latitude) {
      const marker = L.marker(new L.LatLng(station.latitude, station.longitude),
        {icon: this.getColoredIcon(colorHex)}).on('click', event => {
        this.clickedMarker.next(station);
        this.emitData(
          new EmitData(station.name, station.latitude, station.longitude, date, rainValue, metricLabel)
        );
      });

      if (!isNaN(rainValue)) {
        marker.bindPopup(station.name + ' ' + rainValue.toString() + ` ${metricLabel}`);
      } else {
        marker.bindPopup(station.name + ' no data');
      }
      this.markers[station.id] = marker;
      this.group.addLayer(marker);
      this.map.addLayer(this.group);
    }
  }

  updateMarkers(date: string, stations: Station[], data: Observable<HydrologicalDataBase[]>): Promise<void> {
    return data
      .toPromise().then(d => {
        d.filter(item => (moment(item.date)).format('YYYY-MM-DD') === date)
          .forEach(rainData => {
            const rainValue = rainData.value;
            const colorValue = rainValue * 50;
            const filteredStations = stations.filter(station => station.id === rainData.stationId);
            if (filteredStations.length > 0) {
              const station = filteredStations[0];
              const color = this.colorService.getColor(rainValue);
              this.updateMarker(station, this.rgbStringToHex(color), rainValue);
            }
          });
      });
  }

  updateMarker(station: Station, colorHex: string, rainValue: number): void {
    const marker = this.markers[station.id];
    if (marker) {
      marker.setIcon(this.getColoredIcon(colorHex));
      marker.setPopupContent(station.name + ' ' + rainValue.toString() + 'mm');
    }
  }

  rgbStringToHex(rgbString: string): string {
    // tslint:disable-next-line:no-bitwise
    const newStr = rgbString.substring(4, rgbString.length - 1);
    // console.log(newStr);
    const split = newStr.split(',');
    const r = +split[0];
    const g = +split[1];
    const b = +split[2];
    // tslint:disable-next-line:no-bitwise
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  rgbToHex(r: number, g: number, b: number): string {
    // tslint:disable-next-line:no-bitwise
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.url}/stations`);
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

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data`);
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<PrecipitationDayDataNew[]>
    (`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  draw(date: Date): void {
    this.putMarkers(
      this.getStations(),
      this.getDataFromDateAsObservableUsingInstant(date),
      this.info.metricLabel,
      date
    );
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoSubscription(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  clear(): void {
    this.group.clearLayers();
  }
}
