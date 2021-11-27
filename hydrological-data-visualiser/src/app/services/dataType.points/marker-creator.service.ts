import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Station} from '../../model/station';
import * as L from 'leaflet';
import * as moment from 'moment';
import {HydrologicalDataBase} from '../../model/hydrological-data-base';
import 'leaflet.markercluster';
import {ColorService} from '../color.service';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';

@Injectable({
  providedIn: 'root'
})
export abstract class MarkerCreatorService implements DataServiceInterface<HydrologicalDataBase> {
  public url!: string;
  public info!: DataModelBase;
  public map!: L.Map;
  public group = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: zoom => 120 - zoom * 10
  });
  public stationList: Station[] = [];
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
        {icon: this.getColoredIcon(colorHex), opacity: 0.5}).on('click', event => {
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

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date).toPromise().then(d => {
      d.forEach(rainData => {
        const rainValue = rainData.value;
        const filteredStations = this.stationList.filter(station => station.id === rainData.stationId); // stationsList ok?
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

  getStations(): void {
    this.getStationsObservable().subscribe(data => {
      this.stationList = data;
    });
  }

  getData(): Observable<HydrologicalDataBase[]> {
    return this.http.get<HydrologicalDataBase[]>(`${this.url}/data`);
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<HydrologicalDataBase[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<HydrologicalDataBase[]>
    (`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<HydrologicalDataBase[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<HydrologicalDataBase[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getTimePointAfterAsObservable(date: Date, steps: number): Observable<Date> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<Date>(`${this.url}/timePointsAfter?instantFrom=${formattedDate}&step=${steps.toString()}`);
  }

  draw(date: Date): void {
    this.putMarkers(
      this.getDistinctLatLongStations(this.stationList),
      this.getDataFromDateAsObservableUsingInstant(date),
      this.info.metricLabel,
      date
    );
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoObservable(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  clear(): void {
    this.group.clearLayers();
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

  getMinValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/min?instantFrom=${begin}&length=${length}`);
  }

  getMaxValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/max?instantFrom=${begin}&length=${length}`);
  }

  // tslint:disable-next-line:ban-types
  setScaleAndColour(begin: string, length: number, callback: Function): void {
    this.getMinValue(begin, length).subscribe(minValue =>
      this.getMaxValue(begin, length).subscribe(maxValue => {
          this.colorService.setColorMap(minValue, maxValue, this.info.minColour, this.info.maxColour, this.info.metricLabel);
          callback();
        })
    );
  }

  changeOpacity(newOpacity: number): void {
    this.group.setStyle({opacity: newOpacity, fillOpacity: newOpacity});
    for (const key in this.markers) {
      if (this.markers.hasOwnProperty(key)) {
        this.markers[key].setOpacity(newOpacity);
      }
    }
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    // TODO
  }
}
