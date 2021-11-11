import {Injectable} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';
import {PrecipitationService} from './precipitation.service';
import {StationsService} from './stations.service';
import {RiverService} from './river.service';
import {KocinkaSurfaceHeightService} from './kocinka-surface-height.service';
import {HttpClient} from '@angular/common/http';
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
    this.kocinkaRandom.url,
    this.kocinkaSurfaceHeightService.url,
    this.kocinkaTemperatureService.url
  ];

  constructor(
    private http: HttpClient,
    // new dataSource - add constructor to the service here
    private precipitationService: PrecipitationService,
    private stationsService: StationsService,
    private kocinkaRandom: KocinkaRandomService,
    private kocinkaSurfaceHeightService: KocinkaSurfaceHeightService,
    private kocinkaTemperatureService: KocinkaTemperatureService
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
    return this.kocinkaRandom;
  }

  getKocinkaSurfaceHeightService(): KocinkaSurfaceHeightService {
    return this.kocinkaSurfaceHeightService;
  }

  getKocinkaTemperatureService(): KocinkaTemperatureService {
    return this.kocinkaTemperatureService;
  }


  getModels(): void {
    this.apis.forEach(api => {
      console.log(`${api}/info`);
      this.http.get<DataModelBase>(`${api}/info`).subscribe(info => {
        this.dataModels.push(info);
      });
    });
  }
}
