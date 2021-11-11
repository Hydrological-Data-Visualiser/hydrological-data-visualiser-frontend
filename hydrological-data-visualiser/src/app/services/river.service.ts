import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as L from 'leaflet';
import {RiverPoint} from '../model/river-point';
import {LatLng} from 'leaflet';
import {DataModelBase} from "../model/data-model-base";
import {HydrologicalDataBase} from "../model/hydrological-data-base";

@Injectable({
  providedIn: 'root'
})
export class RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinka';
  public status = false;
  public map: any;
  private river: LatLng[] = [];
  private riverLayer = L.layerGroup();
  public info: DataModelBase = this.getInfo();

  constructor(private http: HttpClient) {
  }

  showKocinkaRiver(): void {
    this.http.get<RiverPoint[]>(`${this.url}/data`).subscribe((res: RiverPoint[]) => {
      for (let i = 0; i < res.length - 1; i++) {
        this.river = [];
        this.river.push(new LatLng(res[i].latitude, res[i].longitude));
        this.river.push(new LatLng(res[i + 1].latitude, res[i + 1].longitude));
        const color = this.getColor((Number(res[i].value) + Number(res[i + 1].value)) / 2);
        this.riverLayer.addLayer(L.polyline(this.river, {color}));
        this.riverLayer.addTo(this.map);
      }
    });
  }

  getColor(d: number): string {
    return d < 1 ? '#DEEDCF' :
      d < 1.5 ? '#BFE1B0' :
        d < 2 ? '#99D492' :
          d < 2.5 ? '#56B870' :
            d < 3 ? '#1D9A6C' :
              d < 3.5 ? '#137177' :
                d < 4 ? '#0A2F51' :
                  '#CCEDFF';
  }

  getInfo(): DataModelBase {
    let res!: DataModelBase;
    this.http.get<DataModelBase>(`${this.url}/info`).toPromise().then(info => res = info);

    return res;
  }

  getDataRecordsArrayFromGetRequest(): RiverPoint[] {
    let riv: RiverPoint[] = [];
    this.http.get<RiverPoint[]>(`${this.url}/data`).subscribe((res: RiverPoint[]) => riv = res);
    return riv;
  }

  clear(): void {
    this.riverLayer.clearLayers();
  }
}
