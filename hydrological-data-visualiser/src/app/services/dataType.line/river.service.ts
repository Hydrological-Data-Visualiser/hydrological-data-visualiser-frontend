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

@Injectable({
  providedIn: 'root'
})
export abstract class RiverService implements DataServiceInterface<RiverPoint> {
  public map!: L.Map;
  public info!: DataModelBase;
  public url!: string;

  public status = false;
  private riverLayer = new L.FeatureGroup();

  protected constructor(public sidePanelService: SidePanelService, public http: HttpClient) {
  }

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

  getColor(d: number, points: RiverPoint[]): string {
    const values = points.map(point => point.value).sort();
    const min = values[0];
    const max = values[values.length - 1];
    const diff = Math.abs(max - min) / 7;

    return d < min + diff ? '#0054ff' :
      d < min + 2 * diff ? '#07ffd8' :
        d < min + 3 * diff ? '#00ff29' :
          d < min + 4 * diff ? '#bfff00' :
            d < min + 5 * diff ? '#ffcb00' :
              d < min + 6 * diff ? '#ea7905' :
                d < min + 7 * diff ? '#e74242' :
                  '#ff0000';

  }

  clear(): void {
    this.riverLayer.clearLayers();
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoSubscription(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  draw(date: Date, url: string): void {
    this.riverLayer.clearLayers();
    this.getDataFromDateAsObservableUsingInstant(date).subscribe(points => {
      for (let i = 0; i < points.length - 1; i++) {
        const river = [];
        river.push(new LatLng(points[i].latitude, points[i].longitude));
        river.push(new LatLng(points[i + 1].latitude, points[i + 1].longitude));
        const value = (Number(points[i].value) + Number(points[i + 1].value)) / 2;
        const color = this.getColor(value, points);
        const polyLine = L.polyline(river, {color})
          .bindPopup(`${value.toFixed(2)} ${this.info.metricLabel}`)
          .on('click', () => {
            this.emitData(
              new EmitData(undefined, points[i].latitude, points[i].longitude, points[i].date, points[i].value, this.info.metricLabel)
            );
          });
        this.riverLayer.addLayer(polyLine);
      }
      this.riverLayer.addTo(this.map);
      this.map.fitBounds(this.riverLayer.getBounds());
    });
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return this.http.get<RiverPoint[]>(`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<RiverPoint[]> {
    const formattedDate = moment(date).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<RiverPoint[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }
}
