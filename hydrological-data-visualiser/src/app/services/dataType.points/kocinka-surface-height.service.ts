import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MarkerCreatorService} from './marker-creator.service';
import {DataModelBase} from '../../model/data-model-base';
import {ColorService} from '../color.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaSurfaceHeightService extends MarkerCreatorService {
  public url = 'https://imgw-mock.herokuapp.com/kocinkaPressure';
  public status = false;
  public info!: DataModelBase;

  constructor(public http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService, http);
    this.getInfo();
  }
}
