import { Injectable } from '@angular/core';
import {PolygonsService} from './polygons.service';
import {HttpClient} from '@angular/common/http';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {ColorService} from '../color.service';

@Injectable({
  providedIn: 'root'
})
export class ModflowService extends PolygonsService {
  public url = 'https://imgw-mock.herokuapp.com/modflow';

  constructor(public http: HttpClient, public sidePanelService: SidePanelService, colorService: ColorService) {
    super(sidePanelService, http, colorService);
    this.getInfo();
  }
}
