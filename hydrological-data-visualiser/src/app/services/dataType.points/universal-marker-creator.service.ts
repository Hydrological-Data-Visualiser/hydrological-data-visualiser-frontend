import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ColorService} from '../color.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {Observable} from 'rxjs';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';
import {MarkerCreatorService} from './marker-creator.service';
import {DataModelBase} from '../../model/data-model-base';
import {DataType} from '../../model/data-type';

@Injectable({
  providedIn: 'root'
})
export class UniversalMarkerCreatorService extends MarkerCreatorService{
  constructor(http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService, http);
    this.info = new DataModelBase('creator-service-model-base', '', '', DataType.POINTS, [], '', '', '');
  }

  setUrl(url: string): void {
    this.url = url;
    this.getInfo();
    this.getStations();
  }

}
