import {Component, OnInit} from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-geojson',
  templateUrl: './geojson.component.html',
  styleUrls: ['./geojson.component.css']
})
export class GeojsonComponent implements OnInit {
  fileToUpload: File | null = null;
  geoJson: L.GeoJSON | null = null;

  constructor(private dataProvider: DataProviderService) {
  }

  ngOnInit(): void {
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);
  }

  onSubmit(): void {
    (this.fileToUpload?.text().then(a => {
      if (this.geoJson) {
        this.delete();
      }
      this.geoJson = L.geoJSON(JSON.parse(a));
      this.geoJson.addTo(this.dataProvider.getRiverService().map);
      this.dataProvider.getRiverService().map.fitBounds(this.geoJson.getBounds());
      // @ts-ignore
      document.getElementById('dismissButtonGeoJson').click();
    }));

  }

  delete(): void {
    // @ts-ignore
    this.geoJson.removeFrom(this.dataProvider.getRiverService().map);
    this.geoJson = null;
  }
}
