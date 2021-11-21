import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';
import {RiverService} from './river.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import { ColorService } from '../color.service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaTemperatureService extends RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinkaTemperature';

  constructor(public http: HttpClient, public sidePanelService: SidePanelService, colorService: ColorService) {
    super(sidePanelService, http, colorService);
    this.getInfo();
  }
}

