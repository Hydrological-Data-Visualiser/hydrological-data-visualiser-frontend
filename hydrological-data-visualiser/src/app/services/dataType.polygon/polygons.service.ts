import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {Observable} from 'rxjs';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import * as moment from 'moment';
import {DataModelBase} from '../../model/data-model-base';
import {HttpClient} from '@angular/common/http';
import {ColorService} from '../color.service';
import {CustomMarkers} from '../custom-markers';
import {PolygonData} from '../../model/polygon-data';
import {Station} from 'src/app/model/station';

@Injectable({
  providedIn: 'root'
})
export abstract class PolygonsService implements DataServiceInterface<PolygonData> {
  public map!: L.Map;
  public status = false;
  public url!: string;
  public lastClickedData: [PolygonData, L.LatLng] | undefined = undefined;
  public polygonLayer = new L.FeatureGroup();
  public markerLayer = new L.FeatureGroup();
  public info!: DataModelBase;
  public marker: L.Marker | undefined = undefined;
  public opacity = 0.5;
  public stationList: Station[] = [];
  public polygons: Map<Station, L.Polygon> = new Map<Station, L.Polygon>();

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient, private colorService: ColorService) {
    this.sidePanelService.modelEmitter.subscribe(() => this.opacity = 0.5);
  }

  clear(): void {
    this.polygonLayer.clearLayers();
    this.lastClickedData = undefined;
    if (this.marker) {
      this.markerLayer.removeLayer(this.marker);
    }
    this.polygons.clear();
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  draw(date: Date): void {
    this.sidePanelService.finishEmitter.emit(true);
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date).subscribe(polygonDataArr => {
      polygonDataArr.forEach(polygonData => {
        const polygon = this.stationList[polygonData.polygonId];
        if (polygon) {
          const latlngs: L.LatLng[] = polygon.points.map(points => new L.LatLng(points[0], points[1]));
          const color = this.colorService.getColor(polygonData.value);
          const lPolygon = new L.Polygon(latlngs, {
            color,
            fillColor: color,
            opacity: this.opacity,
            fillOpacity: this.opacity
          })
            .bindPopup(`${polygonData.value} ${this.info.metricLabel}`)
            .on('click', (event: any) => {
              const coords: L.LatLng = event.latlng;
              this.lastClickedData = [polygonData, coords];
              this.emitData(
                new EmitData(polygon.name, coords.lat, coords.lng, polygonData.date, polygonData.value, this.info.metricLabel)
              );
              this.addMarkerOnDataClick(coords);
            });
          this.polygonLayer.addLayer(lPolygon);
          this.polygons.set(polygon, lPolygon);
        }
      });
      this.polygonLayer.addTo(this.map);
      this.map.flyToBounds(this.polygonLayer.getBounds(), {duration: 1});
      this.sidePanelService.finishEmitter.emit(false);
    });
  }

  update(date: Date): Promise<void> {
    return this.getDataFromDateAsObservableUsingInstant(date).toPromise().then(polygonDataArr => {
      polygonDataArr.forEach(polygonData => {
        const station = this.stationList.find(a => a.id === polygonData.polygonId);
        if (station) {
          const polygon = this.polygons.get(station);
          if (polygon) {
            const color = this.colorService.getColor(polygonData.value);
            polygon.setStyle({color, fillColor: color, opacity: this.opacity, fillOpacity: this.opacity});
            polygon.bindPopup(`${polygonData.value} ${this.info.metricLabel}`)
              .on('click', (event: any) => {
                const coords = event.latlng;
                this.lastClickedData = [polygonData, coords];
                this.emitData(
                  new EmitData(undefined, coords.lat, coords.lng, polygonData.date, polygonData.value, this.info.metricLabel)
                );
                this.addMarkerOnDataClick(coords);
              });
            if (this.lastClickedData) {
              if (this.lastClickedData[0].polygonId === polygonData.polygonId) {
                this.emitData(new EmitData(
                  station.name, this.lastClickedData[1].lat, this.lastClickedData[1].lng,
                  polygonData.date, polygonData.value, this.info.metricLabel)
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

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PolygonData[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<PolygonData[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PolygonData[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PolygonData[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getTimePointAfterAsObservable(date: Date, steps: number): Observable<Date> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<Date>(`${this.url}/timePointsAfter?instantFrom=${formattedDate}&step=${steps.toString()}`);
  }

  getDayTimePointsAsObservable(date: Date): Observable<Date[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<Date[]>(`${this.url}/dayTimePoints?date=${formattedDate}`);
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoObservable(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  getMinValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/min?instantFrom=${begin}&length=${length}`);
  }

  getMaxValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/max?instantFrom=${begin}&length=${length}`);
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

  changeOpacity(newOpacity: number): void {
    this.polygonLayer.setStyle({fillOpacity: newOpacity, opacity: newOpacity});
    this.opacity = newOpacity;
  }

  updateColor(date: Date): void {
    this.colorService.updateColorMap(this.info.minColour, this.info.maxColour, this.info.metricLabel);
    this.draw(date);
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
