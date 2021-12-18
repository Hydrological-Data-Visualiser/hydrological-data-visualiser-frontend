import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MarkerCreatorService} from './marker-creator.service';
import {ColorService} from '../color.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {PointData} from '../../model/point-data';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService extends MarkerCreatorService {
  public url = 'https://imgw-mock.herokuapp.com//imgw';

  constructor(http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService, http);
    this.getInfo();
  }

  getData(): Observable<PointData[]> {
    return this.http.get<PointData[]>(`${this.url}/data`);
  }
}
