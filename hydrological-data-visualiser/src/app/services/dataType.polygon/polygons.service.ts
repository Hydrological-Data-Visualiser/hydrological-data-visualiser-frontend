import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {Observable} from 'rxjs';
import {PolygonModel} from '../../model/polygon';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {DataServiceInterface} from '../data.service.interface';
import * as moment from 'moment';
import {DataModelBase} from '../../model/data-model-base';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export abstract class PolygonsService implements DataServiceInterface<PolygonModel> {
  public map!: L.Map;
  public status = false;
  public url!: string;

  public polygonLayer = new L.FeatureGroup();
  public info!: DataModelBase;

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient) {
  }

  clear(): void {
    this.polygonLayer.clearLayers();
  }

  getColor(d: number): string {
    return d < 1 ? '#9c136a' :
      d < 1.5 ? '#440404' :
        d < 2 ? '#000000' :
          d < 2.5 ? '#dca221' :
            d < 3 ? '#fc650d' :
              d < 3.5 ? '#021349' :
                d < 4 ? '#0A2F51' :
                  '#CCEDFF';
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  draw(date: Date): void {
    this.clear();
    this.getDataFromDateAsObservableUsingInstant(date).subscribe(polygons => {
      polygons.forEach(polygon => {
        const latLngs: L.LatLng[] = polygon.points.map(a => new L.LatLng(a[1], a[0]));
        const color = this.getColor(Number(polygon.value));
        const pol = new L.Polygon(latLngs, {color, opacity: 1, fillOpacity: 0.7})
          .bindPopup(`${polygon.value} ${this.info.metricLabel}`)
          .on('click', event => {
            // @ts-ignore
            const coords: L.LatLng = event.latlng;
            this.emitData(
              new EmitData(undefined, coords.lat, coords.lng, polygon.date, polygon.value, this.info.metricLabel)
            );
          });
        this.polygonLayer.addLayer(pol);
        this.polygonLayer.addTo(this.map);
        this.map.fitBounds(this.polygonLayer.getBounds());
      });
    });
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PolygonModel[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<PolygonModel[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PolygonModel[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PolygonModel[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoSubscription(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  getMinValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/min?instantFrom=${begin}&length=${length}`);
  }

  getMaxValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`${this.url}/max?instantFrom=${begin}&length=${length}`);
  }
}
