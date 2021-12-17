import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {RiverService} from './river.service';
import {DataModelBase} from '../../model/data-model-base';
import {DataType} from '../../model/data-type';
import {ColorService} from '../color.service';

@Injectable({
  providedIn: 'root'
})
export class UniversalLineService extends RiverService{
  constructor(public http: HttpClient, public sidePanelService: SidePanelService, colorService: ColorService) {
    super(sidePanelService, http, colorService);
    this.info = new DataModelBase('line-service-model-base', '', '', DataType.LINE, [], '', '', '');
  }

  setUrl(url: string): void {
    this.url = url;
    this.getInfo();
    this.getStations();
  }
}
