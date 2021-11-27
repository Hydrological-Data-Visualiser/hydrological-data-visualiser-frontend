import {Component, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('fileInput') fileInput: any;

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
      this.geoJson = L.geoJSON(JSON.parse(a), {style: {opacity: 0.5, fillOpacity: 0.5}});
      this.geoJson.addTo(this.dataProvider.getKocinkaRandomService().map);
      this.dataProvider.getKocinkaRandomService().map.fitBounds(this.geoJson.getBounds());
      // @ts-ignore
      document.getElementById('dismissButtonGeoJson').click();
    }));

  }

  delete(): void {
    if (this.geoJson) {
      this.geoJson.removeFrom(this.dataProvider.getKocinkaRandomService().map);
      this.geoJson = null;
    }
  }


  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.fileToUpload = files[0];
  }
}
