import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SidePanelService} from '../../components/side-panel/side-panel-service';
import {PolygonsService} from './polygons.service';
import {Observable} from 'rxjs';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';

@Injectable({
  providedIn: 'root'
})
export class UniversalPolygonsService extends PolygonsService{

  constructor(public http: HttpClient, public sidePanelService: SidePanelService) {
    super(sidePanelService, http);
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data`);
  }

  setUrl(url: string): void {
    this.url = url;
    this.getData();
    this.getInfo();
  }
}
