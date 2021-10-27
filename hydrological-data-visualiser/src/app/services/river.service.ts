import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as L from 'leaflet';
import {RiverPoint} from '../model/river-point';
import {LatLng} from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class RiverService {
  public status = true;
  public map: any;
  private river: LatLng[] = [];
  private riverLayer = L.layerGroup();

  constructor(private http: HttpClient) {
  }

  showKocinkaRiver(): void {
    if (!this.status) {
      this.riverLayer.clearLayers();
    } else {
      this.http.get<RiverPoint[]>('https://imgw-mock.herokuapp.com/kocinka/data').subscribe((res: RiverPoint[]) => {
        for (let i = 0; i < res.length - 1; i++) {
          this.river.push(new LatLng(res[i].latitude, res[i].longitude));
          this.river.push(new LatLng(res[i + 1].latitude, res[i + 1].longitude));
          const color = this.getColor((Number(res[i].value) + Number(res[i + 1].value)) / 2);
          this.riverLayer.addLayer(L.polyline(this.river, {color}));
          this.riverLayer.addTo(this.map);
        }
      });
    }
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
}
