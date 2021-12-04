import {Component, OnInit, ViewChild} from '@angular/core';
// @ts-ignore
import parse_georaster from 'georaster';
import {DataProviderService} from '../../services/data-provider.service';
import {HttpClient} from '@angular/common/http';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
// @ts-ignore
import proj4 from 'proj4';

window.proj4 = proj4;


@Component({
  selector: 'app-geotiff',
  templateUrl: './geotiff.component.html',
  styleUrls: ['./geotiff.component.css']
})
export class GeotiffComponent implements OnInit {
  @ViewChild('fileInput') fileInput: any;
  fileToUpload!: File;
  geoTiff: any;
  uploadStarted = false;

  constructor(private dataProvider: DataProviderService, private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];
  }

  onSubmit(): void {
    if (this.geoTiff) {
      this.geoTiff.removeFrom(this.dataProvider.getKocinkaRandomService().map);
      this.geoTiff = null;
    }
    const reader = new FileReader();
    this.uploadStarted = true;
    reader.readAsArrayBuffer(this.fileToUpload);

    const map = this.dataProvider.getKocinkaRandomService().map;
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      parse_georaster(arrayBuffer).then((georaster: any) => {
        this.geoTiff = new GeoRasterLayer({
          georaster,
          opacity: 0.5,
          resolution: 256
        });
        this.geoTiff.addTo(map);
        map.flyToBounds(this.geoTiff.getBounds());
        this.uploadStarted = false;
        // @ts-ignore
        document.getElementById('dismissButtonGeoTiff').click();
      });
    };

  }

  delete(): void {
    this.geoTiff.removeFrom(this.dataProvider.getKocinkaRandomService().map);
    this.geoTiff = null;
  }

  onClickFileInputButton(): void {
    this.fileInput.nativeElement.click();
  }

  onChangeFileInput(): void {
    const files: { [key: string]: File } = this.fileInput.nativeElement.files;
    this.fileToUpload = files[0];
  }

}
