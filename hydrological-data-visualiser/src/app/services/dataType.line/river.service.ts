import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {RiverPoint} from '../../model/river-point';
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
        const color = this.getColor(value, points);
        const polyLine = L.polyline(river, {color}).bindPopup(`${value.toFixed(2)} ${metricLabel}`);
        this.riverLayer.addLayer(polyLine);
      }
      this.riverLayer.addTo(this.map);
      this.map.fitBounds(this.riverLayer.getBounds());
    });

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
}
