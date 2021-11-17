import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {Observable} from 'rxjs';
import {PolygonModel} from '../model/polygon';

@Injectable({
  providedIn: 'root'
})
export class PolygonsService {
  public map!: L.Map;
  public status = false;
  public polygonLayer = new L.FeatureGroup();

  constructor() {
  }

  drawPolygons(data: Observable<PolygonModel[]>): void {
    this.clear();
    data.subscribe(polygons => {
      polygons.forEach(polygon => {
        const latLngs: L.LatLng[] = polygon.points.map(a => new L.LatLng(a[1], a[0]));
        const color = this.getColor(Number(polygon.value));
        const pol = new L.Polygon(latLngs, {color, opacity: 1, fillOpacity: 0.7});
        this.polygonLayer.addLayer(pol);
        this.polygonLayer.addTo(this.map);
        this.map.fitBounds(this.polygonLayer.getBounds());
      });
    });
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

}
