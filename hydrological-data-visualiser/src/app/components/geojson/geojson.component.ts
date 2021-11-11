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

  constructor(private dataProvider: DataProviderService) {
  }

  ngOnInit(): void {
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);
    (this.fileToUpload?.text().then(a => L.geoJSON(JSON.parse(a)).addTo(this.dataProvider.getKocinkaRandomService().map)
    ));
  }
}
