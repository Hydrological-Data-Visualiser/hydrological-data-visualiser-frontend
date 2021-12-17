import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MarkerCreatorService} from './marker-creator.service';
import {ColorService} from '../color.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class KocinkaSurfaceHeightService extends MarkerCreatorService {
  public url = 'http://localhost:8080/kocinkaPressure';

  constructor(public http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService, http);
    this.getInfo();
  }
}
