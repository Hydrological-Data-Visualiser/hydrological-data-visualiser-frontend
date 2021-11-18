import {Injectable} from '@angular/core';
import * as L from 'leaflet';
import {Observable} from 'rxjs';
import {PolygonModel} from '../../model/polygon';
import {EmitData} from '../../model/emit-data';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class PolygonsService {
  public map!: L.Map;
  public status = false;
  public polygonLayer = new L.FeatureGroup();

  constructor(public sidePanelService: SidePanelService) {
  }

  drawPolygons(data: Observable<PolygonModel[]>, metricLabel: string): void {
    this.clear();
    data.subscribe(polygons => {
      polygons.forEach(polygon => {
        const latLngs: L.LatLng[] = polygon.points.map(a => new L.LatLng(a[1], a[0]));
        const color = this.getColor(Number(polygon.value));
        const pol = new L.Polygon(latLngs, {color, opacity: 1, fillOpacity: 0.7})
          .bindPopup(`${polygon.value} ${metricLabel}`)
          .on('click', event => {
            // @ts-ignore
            const coords: L.LatLng = event.latlng;
            this.emitData(
              new EmitData(undefined, coords.lat, coords.lng, polygon.date, polygon.value, metricLabel)
            );
          });
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

  emitData(data: EmitData): void {
    this.sidePanelService.emitData(data);
  }

}
