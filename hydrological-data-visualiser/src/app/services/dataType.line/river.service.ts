import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {RiverPoint} from '../../model/river-point';
import {Observable} from 'rxjs';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {HttpClient} from '@angular/common/http';
import {DataServiceInterface} from '../data.service.interface';
import {DataModelBase} from '../../model/data-model-base';
import * as moment from 'moment';
import {ColorService} from '../color.service';
import {CustomMarkers} from '../custom-markers';

@Injectable({
  providedIn: 'root'
})
export abstract class RiverService implements DataServiceInterface<RiverPoint> {
  public map!: L.Map;
  public info!: DataModelBase;
  public url!: string;
  public lastClickedData: [RiverPoint, L.LatLng] | undefined = undefined;

  public status = false;
  public marker: L.Marker | undefined = undefined;
  public markerLayer = new L.FeatureGroup();
  public opacity = 0.5;
  private riverLayer = new L.FeatureGroup();

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient, private colorService: ColorService) {
    this.sidePanelService.modelEmitter.subscribe(() => this.opacity = 0.5);
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  clear(): void {
    this.riverLayer.clearLayers();
    this.lastClickedData = undefined;
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
    }
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoObservable(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  draw(date: Date): void {
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date).subscribe(points => {
      for (let i = 0; i < points.length - 1; i++) {
        const river = [];
        river.push(new LatLng(points[i].latitude, points[i].longitude));
        river.push(new LatLng(points[i + 1].latitude, points[i + 1].longitude));
        const value = (Number(points[i].value) + Number(points[i + 1].value)) / 2;
        const color = this.colorService.getColor(points[i].value);
        const polyLine = L.polyline(river, {color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity})
          .bindPopup(`${value.toFixed(2)} ${this.info.metricLabel}`)
          .on('click', (event: any) => {
            const coords = event.latlng;
            this.addMarkerOnDataClick(coords);
            this.emitData(
              new EmitData(undefined, coords.lat, coords.lng, points[i].date, points[i].value, this.info.metricLabel)
            );
            this.lastClickedData = [points[i], coords];
          });
        this.riverLayer.addLayer(polyLine);
      }
      this.riverLayer.addTo(this.map);
      this.map.flyToBounds(this.riverLayer.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(true);
    });
  }

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date).toPromise().then(points => {
      this.riverLayer.clearLayers();
      for (let i = 0; i < points.length - 1; i++) {
        const river = [];
        river.push(new LatLng(points[i].latitude, points[i].longitude));
        river.push(new LatLng(points[i + 1].latitude, points[i + 1].longitude));
        const value = (Number(points[i].value) + Number(points[i + 1].value)) / 2;
        const color = this.colorService.getColor(points[i].value);
        const polyLine = L.polyline(river, {color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity})
          .bindPopup(`${value.toFixed(2)} ${this.info.metricLabel}`)
          .on('click', (event: any) => {
            const coords = event.latlng;
            this.lastClickedData = [points[i], coords];
            this.emitData(
              new EmitData(undefined, coords.lat, coords.lng, points[i].date, points[i].value, this.info.metricLabel)
            );
            this.addMarkerOnDataClick(coords);
          });
        if (this.lastClickedData) {
          if (this.lastClickedData[0].id === points[i].id) {
            this.emitData(new EmitData(
              undefined, this.lastClickedData[1].lat, this.lastClickedData[1].lng, date, value, this.info.metricLabel)
            );
          }
        }
        this.riverLayer.addLayer(polyLine);
      }
      this.riverLayer.addTo(this.map); // no fit bounds
    });
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

  getDataFromDateAsObservableUsingDate(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<RiverPoint[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<RiverPoint[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getTimePointAfterAsObservable(date: Date, steps: number): Observable<Date> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<Date>(`${this.url}/timePointsAfter?instantFrom=${formattedDate}&step=${steps.toString()}`);
  }

  getDayTimePointsAsObservable(date: Date): Observable<Date[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<Date[]>(`${this.url}/dayTimePoints?date=${formattedDate}`);
  }

  getMinValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/min?instantFrom=${begin}&length=${length}`);
  }

  getMaxValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/max?instantFrom=${begin}&length=${length}`);
  }

  changeOpacity(newOpacity: number): void {
    this.riverLayer.setStyle({fillOpacity: newOpacity, opacity: newOpacity});
    this.opacity = newOpacity;
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    this.draw(date);
  }

  addMarkerOnDataClick(coords: L.LatLng): void {
    this.markerLayer.addTo(this.map);
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
      this.marker = undefined;
    }
    const marker: L.Marker = L.marker(coords, {icon: CustomMarkers.blackIcon})
      .on('click', () => {
        this.markerLayer.removeLayer(marker);
        this.marker = undefined;
        this.sidePanelService.emitData(new EmitData(undefined, undefined, undefined, undefined, undefined, undefined));
        this.lastClickedData = undefined;
      });
    this.markerLayer.addLayer(marker);
    this.marker = marker;
  }
}
