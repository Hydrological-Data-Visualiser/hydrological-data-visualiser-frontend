import {Injectable} from '@angular/core';
import {RiverPoint} from '../../model/river-point';
import {HttpClient} from '@angular/common/http';
import {DataModelBase} from '../../model/data-model-base';
import {RiverService} from './river.service';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {DataServiceInterface} from '../data.service.interface';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaRandomService extends RiverService {
  public url = 'https://imgw-mock.herokuapp.com/kocinka';

  constructor(public http: HttpClient, public sidePanelService: SidePanelService) {
    super(sidePanelService, http);
    this.getInfo();
  }
}
