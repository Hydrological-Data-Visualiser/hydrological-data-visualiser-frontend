import {Injectable} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';
import {PrecipitationService} from './dataType.points/precipitation.service';
import {KocinkaSurfaceHeightService} from './dataType.points/kocinka-surface-height.service';
import {HttpClient} from '@angular/common/http';
import {PolygonsRandomService} from './dataType.polygon/polygons-random.service';
import {KocinkaRandomService} from './dataType.line/kocinka-random.service';
import {KocinkaTemperatureService} from './dataType.line/kocinka-temperature.service';
import {DataServiceInterface} from './data.service.interface';
import {UniversalPolygonsService} from './dataType.polygon/universal-polygons.service';
import {UniversalLineService} from './dataType.line/universal-line.service';
import {UniversalMarkerCreatorService} from './dataType.points/universal-marker-creator.service';
import {DataType} from '../model/data-type';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  selectedModel!: string;
  dataModels: DataModelBase[] = [];
  dataModelServices: DataServiceInterface<any>[] = [
    this.getKocinkaTemperatureService(),
    this.getKocinkaRandomService(),
    this.getPrecipitationService(),
    this.getKocinkaSurfaceHeightService(),
    this.getPolygonsRandomService(),
    this.getUniversalMarkerCreatorService(),
    this.getUniversalPolygonsService(),
    this.getUniversalLineService()
  ];

  apis: string[] = [
    this.precipitationService.url,
    this.kocinkaRandomService.url,
    this.kocinkaSurfaceHeightService.url,
    this.kocinkaTemperatureService.url,
    this.polygonsRandomService.url,
  ];

  addedModels: Map<string, DataType> = new Map<string, DataType>();

  addedModelUrls: Map<string, string> = new Map<string, string>();

  constructor(
    private http: HttpClient,
    // new dataSource - add constructor to the service here
    private precipitationService: PrecipitationService,
    private kocinkaRandomService: KocinkaRandomService,
    private kocinkaSurfaceHeightService: KocinkaSurfaceHeightService,
    private kocinkaTemperatureService: KocinkaTemperatureService,
    private polygonsRandomService: PolygonsRandomService,
    private universalMarkerCreatorService: UniversalMarkerCreatorService,
    private universalPolygonsService: UniversalPolygonsService,
    private universalLineService: UniversalLineService
  ) {
    this.getModels();
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

  getUniversalMarkerCreatorService(): UniversalMarkerCreatorService {
    return this.universalMarkerCreatorService;
  }

  getUniversalPolygonsService(): UniversalPolygonsService {
    return this.universalPolygonsService;
  }

  getUniversalLineService(): UniversalLineService {
    return this.universalLineService;
  }

  getModels(): void {
    this.dataModels = [];
    this.apis.forEach(api => {
      this.http.get<DataModelBase>(`${api}/info`).subscribe(info => {
        if (info !== undefined) {
          this.dataModels.push(info);
        }
      });
    });
  }

  getActualService(): DataServiceInterface<any> {
    let actualService = this.getAllServices().filter(service => service.info.id === this.selectedModel)[0];
    if (actualService === undefined) {
      const dataType = this.addedModels.get(this.selectedModel);
      switch (dataType) {
        case DataType.POLYGON:
          this.universalPolygonsService.setUrl(this.addedModelUrls.get(this.selectedModel) as string);
          actualService = this.universalPolygonsService;
          break;
        case DataType.POINTS:
          this.universalMarkerCreatorService.setUrl(this.addedModelUrls.get(this.selectedModel) as string);
          actualService = this.universalMarkerCreatorService;
          break;
        case DataType.LINE:
          this.universalLineService.setUrl(this.addedModelUrls.get(this.selectedModel) as string);
          actualService = this.universalLineService;
          break;
      }
    }
    return actualService;
  }

  getAllServices(): DataServiceInterface<any>[] {
    return this.dataModelServices;
  }
}
