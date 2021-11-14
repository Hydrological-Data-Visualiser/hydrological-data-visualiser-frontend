import {Injectable} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';
import {PrecipitationService} from './precipitation.service';
import {StationsService} from './stations.service';
import {KocinkaSurfaceHeightService} from './kocinka-surface-height.service';
import {HttpClient} from '@angular/common/http';
import {PolygonsRandomService} from './polygons-random.service';
import {KocinkaRandomService} from './kocinka-random.service';
import {KocinkaTemperatureService} from './kocinka-temperature.service';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  selectedModel!: string;
  dataModels: DataModelBase[] = [];

  apis: string[] = [
    this.precipitationService.url,
    this.kocinkaRandomService.url,
    this.kocinkaSurfaceHeightService.url,
    this.kocinkaTemperatureService.url,
    this.polygonsRandomService.url
  ];

  constructor(
    private http: HttpClient,
    // new dataSource - add constructor to the service here
    private precipitationService: PrecipitationService,
    private stationsService: StationsService,
    private kocinkaRandomService: KocinkaRandomService,
    private kocinkaSurfaceHeightService: KocinkaSurfaceHeightService,
    private kocinkaTemperatureService: KocinkaTemperatureService,
    private polygonsRandomService: PolygonsRandomService
  ) {
    // precipitationService.getDataRecordsArrayFromGetRequest();
    this.getModels();
  }

  getStationsService(): StationsService {
    return this.stationsService;
  }

  getPrecipitationService(): PrecipitationService {
    return this.precipitationService;
  }

  getKocinkaRandomService(): KocinkaRandomService {
    return this.kocinkaRandomService;
  }

  getKocinkaSurfaceHeightService(): KocinkaSurfaceHeightService {
    return this.kocinkaSurfaceHeightService;
  }

  getKocinkaTemperatureService(): KocinkaTemperatureService {
    return this.kocinkaTemperatureService;
  }

  getPolygonsRandomService(): PolygonsRandomService {
    return this.polygonsRandomService;
  }


  getModels(): void {
    this.apis.forEach(api => {
      console.log(`${api}/info`);
      this.http.get<DataModelBase>(`${api}/info`).subscribe(info => {
        this.dataModels.push(info);
      });
    });
  }

  getActualService(): any {
    switch (this.selectedModel) {
      case this.getKocinkaRandomService().info.id :
        return this.getKocinkaRandomService();

      case this.getPrecipitationService().info.id:
        return this.getPrecipitationService();

      case this.getKocinkaSurfaceHeightService().info.id:
        return this.getKocinkaSurfaceHeightService();

      case this.getKocinkaTemperatureService().info.id:
        return this.getKocinkaTemperatureService();

      case this.getPolygonsRandomService().info.id:
        return this.getPolygonsRandomService();

      default:
        return null;
    }
  }

  getAllServices(): any[] {
    return [
      this.getKocinkaTemperatureService(),
      this.getKocinkaRandomService(),
      this.getPrecipitationService(),
      this.getKocinkaSurfaceHeightService(),
      this.getPolygonsRandomService()
    ];
  }
}
