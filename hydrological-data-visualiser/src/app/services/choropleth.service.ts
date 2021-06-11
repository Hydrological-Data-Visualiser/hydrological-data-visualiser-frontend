import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
@Injectable({
  providedIn: 'root'
})
export class ChoroplethService {
  example: string = '/assets/data/choropleth_example.geojson';

  constructor(private http: HttpClient) { }

  showExampleChoropleth(map: L.Map): void {
    this.http.get(this.example).subscribe((res: any) => {
      L.geoJSON(res, {style: this.style}).addTo(map);
    })
  }

  private style(feature: any) {
    return {
        fillColor: getColor(feature.properties.humidity),
        weight: 2,
        opacity: 0,
        color: 'white',
        fillOpacity: 0.5
    };
  }


}

export function getColor(d: Number) {
  return d < 10 ? '#DEEDCF' :
      d < 15 ? '#BFE1B0' :
      d < 20 ? '#99D492' :
      d < 25 ? '#56B870' :
      d < 30 ? '#1D9A6C' :
      d < 35 ? '#137177' :
      d < 40 ? '#0A2F51' :
      '#CCEDFF';
}