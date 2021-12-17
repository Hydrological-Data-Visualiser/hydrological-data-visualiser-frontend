import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {Observable} from 'rxjs';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {HttpClient} from '@angular/common/http';
import {DataServiceInterface} from '../data.service.interface';
import {DataModelBase} from '../../model/data-model-base';
import * as moment from 'moment';
import {ColorService} from '../color.service';
import {CustomMarkers} from '../custom-markers';
import {PolylineData} from '../../model/polyline-data';
import {Station} from '../../model/station';

@Injectable({
  providedIn: 'root'
})
export abstract class RiverService implements DataServiceInterface<PolylineData> {
  public map!: L.Map;
  public info!: DataModelBase;
  public url!: string;
  public lastClickedData: [PolylineData, L.LatLng] | undefined = undefined;

  public status = false;
  public marker: L.Marker | undefined = undefined;
  public markerLayer = new L.FeatureGroup();
  public opacity = 0.5;
  public stationList: Station[] = [];
  public polyLines: Map<Station, L.Polyline> = new Map<Station, L.Polyline>();
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
    this.polyLines.clear();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoObservable(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  draw(date: Date): void {
    this.sidePanelService.finishEmitter.emit(true);
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date).subscribe(polylineDataArr => {
      polylineDataArr.forEach(polylineData => {
        const polyline = this.stationList.find(a => a.id === polylineData.polylineId);
        if (polyline) {
          const river =
            [new L.LatLng(polyline.points[0][0], polyline.points[0][1]), new L.LatLng(polyline.points[1][0], polyline.points[1][1])];
          const color = this.colorService.getColor(polylineData.value);
          const lPolyline = new L.Polyline(river, {
            color,
            fillColor: color,
            opacity: this.opacity,
            fillOpacity: this.opacity
          })
            .bindPopup(`${polylineData.value} ${this.info.metricLabel}`)
            .on('click', (event: any) => {
              const coords = event.latlng;
              this.addMarkerOnDataClick(coords);
              this.emitData(
                new EmitData(polyline.name, coords.lat, coords.lng, polylineData.date, polylineData.value, this.info.metricLabel)
              );
              this.lastClickedData = [polylineData, coords];
            });
          this.riverLayer.addLayer(lPolyline);
          this.polyLines.set(polyline, lPolyline);
        }
      });
      this.riverLayer.addTo(this.map);
      this.map.flyToBounds(this.riverLayer.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(false);
    });
  }

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date).toPromise().then(polylineDataArr => {
      polylineDataArr.forEach(polylineData => {
        const station = this.stationList.find(a => a.id === polylineData.polylineId);
        if (station) {
          const polyline = this.polyLines.get(station);
          if (polyline) {
            const color = this.colorService.getColor(polylineData.value);
            polyline.setStyle({color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity});
            polyline.bindPopup(`${polylineData.value} ${this.info.metricLabel}`)
              .on('click', (event: any) => {
                const coords = event.latlng;
                this.lastClickedData = [polylineData, coords];
                this.emitData(
                  new EmitData(undefined, coords.lat, coords.lng, polylineData.date, polylineData.value, this.info.metricLabel)
                );
                this.addMarkerOnDataClick(coords);
              });
            if (this.lastClickedData) {
              if (this.lastClickedData[0].polylineId === polylineData.polylineId) {
                this.emitData(new EmitData(
                  undefined, this.lastClickedData[1].lat, this.lastClickedData[1].lng,
                  polylineData.date, polylineData.value, this.info.metricLabel)
                );
              }
            }
          }
        }
      });
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

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PolylineData[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<PolylineData[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PolylineData[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PolylineData[]>(`${this.url}/data?dateInstant=${formattedDate}`);
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

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.url}/stations`);
  }

  getStations(): void {
    this.getStationsObservable().subscribe(data => {
      this.stationList = data;
    });
  }
}
