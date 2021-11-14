import {Component, OnInit} from '@angular/core';
// @ts-ignore
import parse_georaster from 'georaster';
import {DataProviderService} from '../../services/data-provider.service';
import {HttpClient} from '@angular/common/http';
import GeoRasterLayer from 'georaster-layer-for-leaflet';


@Component({
  selector: 'app-geotiff',
  templateUrl: './geotiff.component.html',
  styleUrls: ['./geotiff.component.css']
})
export class GeotiffComponent implements OnInit {
  fileToUpload!: File;
  geoTiff: any;

  constructor(private dataProvider: DataProviderService, private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  handleFileInput(event: any): void {
    this.fileToUpload = event.target.files[0];
  }

  onSubmit(): void {
    const reader = new FileReader();

    reader.readAsArrayBuffer(this.fileToUpload);

    const map = this.dataProvider.getKocinkaRandomService().map;
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      parse_georaster(arrayBuffer).then((georaster: any) => {
        this.geoTiff = new GeoRasterLayer({
          georaster,
          opacity: 0.7,
          resolution: 256
        });
        this.geoTiff.addTo(map);
        map.fitBounds(this.geoTiff.getBounds());
      });
    };
    // @ts-ignore
    document.getElementById('dismissButtonGeoTiff').click();

  }

  delete(): void {
    // @ts-ignore
    this.geoTiff.removeFrom(this.dataProvider.getKocinkaRandomService().map);
    this.geoTiff = null;
  }

}
