import {Injectable} from '@angular/core';
import {DataModelBase} from '../model/data-model-base';
import {PrecipitationService} from './precipitation.service';
import {ImgwModel} from '../model/imgw-model';
import {DataType} from '../model/data-type';
import {StationsService} from './stations.service';
import {RiverService} from './river.service';
import {KocinkaSurfaceHeightService} from './kocinka-surface-height.service';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  dataModels: DataModelBase[] = [];

  constructor(
    private precipitationService: PrecipitationService,
    private stationsService: StationsService,
    private riverService: RiverService,
    private kocinkaSurfaceHeightService: KocinkaSurfaceHeightService
  ) {
    precipitationService.getDataRecordsArrayFromGetRequest();
  }

  getStationsService(): StationsService {
    return this.stationsService;
  }

  getPrecipitationService(): PrecipitationService {
    return this.precipitationService;
  }

  getRiverService(): RiverService {
    return this.riverService;
  }

  getKocinkaSurfaceHeightService(): KocinkaSurfaceHeightService {
    return this.kocinkaSurfaceHeightService;
}

  getModels(): DataModelBase[] {
    return [new ImgwModel(
      // TODO: modelName and description parameters SHOULD be provided by a result of a GET /info request from IMGW API
      'IMGW',
      'Precipitation data from IMGW API.',
      DataType.POINTS,
      this.precipitationService.getDataRecordsArrayFromGetRequest()
    )];
  }
}
