import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';
import {Observable} from 'rxjs';
import {MarkerCreatorService} from './marker-creator.service';
import {ColorService} from '../color.service';
import {SidePanelService} from '../../components/side-panel/side-panel-service';

@Injectable({
  providedIn: 'root'
})
export class PrecipitationService extends MarkerCreatorService {
  public url = 'https://imgw-mock.herokuapp.com/imgw';

  constructor(http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService, http);
    this.getInfo();
    this.getStations();
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data`);
  }
}
