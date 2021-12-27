import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Station} from '../../model/station';
import * as L from 'leaflet';
import * as moment from 'moment';
import 'leaflet.markercluster';
import {ColorService} from '../color.service';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';
import {CustomMarkers} from '../custom-markers';
import {HydrologicalData} from '../../model/hydrological-data';

@Injectable({
  providedIn: 'root'
})
export abstract class MarkerCreatorService implements DataServiceInterface<HydrologicalData> {
  public url!: string;
  public info!: DataModelBase;
  public map!: L.Map;
  public group = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: zoom => 120 - zoom * 10
  });
  public stationList: Station[] = [];
  public lastClickedData: [HydrologicalData, L.LatLng] | undefined = undefined;
  public marker: L.Marker | undefined = undefined;
  public opacity = 0.5;
  private markers: Map<Station, L.Marker> = new Map<Station, L.Marker>();

  protected constructor(protected colorService: ColorService, protected sidePanelService: SidePanelService, public http: HttpClient) {
    this.sidePanelService.modelEmitter.subscribe(() => this.opacity = 0.5);
  }

  putMarkers(stations: Station[], data: Observable<HydrologicalData[]>, metricLabel: string, date: Date): void {
    this.sidePanelService.finishEmitter.emit(true);
    this.clear();

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
      this.map.flyToBounds(this.group.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(false);
    });
    this.map.addLayer(this.group);
  }

  createMarker(station: Station, colorHex: string, rainValue: number, metricLabel: string, date: Date): void {
    if (station.points && station.points[0]) {
      const latitude = station.points[0][0];
      const longitude = station.points[0][1];
      const marker = L.marker(new L.LatLng(latitude, longitude),
        {icon: CustomMarkers.getColoredIcon(colorHex), opacity: this.opacity})
        .bindPopup(station.name + ' ' + rainValue.toString() + ` ${metricLabel}`)
        .on('click', event => {
          this.lastClickedData =
            [new HydrologicalData(station.id, station.id, date, rainValue), new L.LatLng(latitude, longitude)];
          this.emitData(
            new EmitData(station.name, latitude, longitude, date, rainValue, metricLabel)
          );
        });
      this.markers.set(station, marker);
      this.group.addLayer(marker);
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
          this.updateMarker(station, this.rgbStringToHex(color), rainValue, date);
        }
      });
    });
  }

  updateMarker(station: Station, colorHex: string, rainValue: number, date: Date): void {
    const marker = this.markers.get(station);
    const latitude = station.points[0][0];
    const longitude = station.points[0][1];
    if (marker) {
      marker.setIcon(CustomMarkers.getColoredIcon(colorHex));
      marker.setPopupContent(station.name + ' ' + rainValue.toString() + this.info.metricLabel);
      marker
        .on('click', () => this.emitData(
          new EmitData(station.name, latitude, longitude, date, rainValue, this.info.metricLabel))
        );
    }
    if (this.lastClickedData) {
      if (this.lastClickedData[0].stationId === station.id) {
        this.emitData(
          new EmitData(station.name, this.lastClickedData[1].lat, this.lastClickedData[1].lng,
            date, rainValue, this.info.metricLabel)
        );
      }
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

  getData(): Observable<HydrologicalData[]> {
    return this.http.get<HydrologicalData[]>(`${this.url}/data`);
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<HydrologicalData[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<HydrologicalData[]>
    (`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<HydrologicalData[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<HydrologicalData[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getTimePointAfterAsObservable(date: Date, steps: number): Observable<Date> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<Date>(`${this.url}/timePointsAfter?instantFrom=${formattedDate}&step=${steps.toString()}`);
  }

  getDayTimePointsAsObservable(date: Date): Observable<Date[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<Date[]>(`${this.url}/dayTimePoints?date=${formattedDate}`);
  }

  getLengthBetweenObservable(startDate: Date, endDate: Date): Observable<number> {
    const formattedStartDate = (moment(startDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    const formattedEndDate = (moment(endDate)).format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    return this.http.get<number>(`${this.url}/length?instantFrom=${formattedStartDate}&&instantTo=${formattedEndDate}`);
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
    this.lastClickedData = undefined;
    this.markers.clear();
  }

  getDistinctLatLongStations(stations: Station[]): Station[] {
    const tab: number[] = [];
    const retVal: Station[] = [];
    stations.forEach(a => {
      const latitude = a.points[0][0];
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
    this.opacity = newOpacity;
    this.group.setStyle({opacity: newOpacity, fillOpacity: newOpacity});
    this.markers.forEach(marker => marker.setOpacity(newOpacity));
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    this.draw(date);
  }
}
