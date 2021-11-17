import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {RiverPoint} from '../model/river-point';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RiverService {
  public status = false;
  public map: any;
  private riverLayer = new L.FeatureGroup();

  constructor() {
  }

  drawRiver(data: Observable<RiverPoint[]>, metricLabel: string): void {
    this.riverLayer.clearLayers();
    data.subscribe(points => {
      for (let i = 0; i < points.length - 1; i++) {
        const river = [];
        river.push(new LatLng(points[i].latitude, points[i].longitude));
        river.push(new LatLng(points[i + 1].latitude, points[i + 1].longitude));
        const value = (Number(points[i].value) + Number(points[i + 1].value)) / 2;
        const color = this.getColor(value);
        const polyLine = L.polyline(river, {color}).bindPopup(`${value.toFixed(2)} ${metricLabel}`);
        this.riverLayer.addLayer(polyLine);
      }
      this.riverLayer.addTo(this.map);
      this.map.fitBounds(this.riverLayer.getBounds());
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

  clear(): void {
    this.riverLayer.clearLayers();
  }
}
