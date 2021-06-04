import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class RiverService {
  kocinka: string = '/assets/data/kocinka.geojson';

  constructor(private http: HttpClient) { }

  showKocinkaRiver(map: L.Map): void {
    this.http.get(this.kocinka).subscribe((res: any) => {
      var cords = res.features[0].geometry.coordinates;
      for (let i = 0; i < cords.length - 1; i++) {
        var table = [[cords[i][1], cords[i][0]], [cords[i+1][1], cords[i+1][0]]];
        var color = this.getColor((parseInt(cords[i][2] + parseInt(cords[i+1][2]))/2));
        L.polyline(table, {color: color}).addTo(map);
      }
    });  
  }

  getColor(d: Number) {
    return d == 1 ? '#DEEDCF' :
        d == 1.5 ? '#BFE1B0' :
        d == 2 ? '#99D492' :
        d == 2.5 ? '#56B870' :
        d == 3 ? '#1D9A6C' :
        d == 3.5 ? '#137177' :
        d == 4 ? '#0A2F51' :
        '#CCEDFF';
  }
}
