import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Station} from '../../model/station';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';
import {MarkerCreatorService} from './marker-creator.service';
import * as moment from 'moment';
import {DataModelBase} from '../../model/data-model-base';
import {DataServiceInterface} from '../data.service.interface';
import {ColorService} from '../color.service';
import {SidePanelService} from "../../components/side-panel/side-panel-service";

@Injectable({
  providedIn: 'root'
})
export class KocinkaSurfaceHeightService extends MarkerCreatorService implements DataServiceInterface<PrecipitationDayDataNew>{
  public url = 'https://imgw-mock.herokuapp.com/kocinkaPressure';
  public status = false;
  public info!: DataModelBase;

  constructor(private http: HttpClient, colorService: ColorService, protected sidePanelService: SidePanelService) {
    super(colorService, sidePanelService);
    this.getInfo();
  }

  getStationsObservable(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.url}/stations`);
  }

  getStations(): Station[] {
    const stat: Station[] = [];
    this.getStationsObservable().subscribe(data => {
      this.stations$.subscribe(value => {
        stat.push(value);
      });
      data.forEach(value => {
        this.stations.next(new Station(
          value.id,
          value.name.charAt(0).toUpperCase() + value.name.slice(1).toLowerCase(),
          value.geoId,
          value.latitude,
          value.longitude
        ));
      });
    });
    return stat;
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data`);
  }

  getDataFromDateAsObservableUsingDate(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD');
    return this.http.get<PrecipitationDayDataNew[]>
    (`${this.url}/data?date=${formattedDate}`);
  }

  getDataFromDateAsObservableUsingInstant(date: Date): Observable<PrecipitationDayDataNew[]> {
    const formattedDate = (moment(date)).format('YYYY-MM-DD[T]HH:mm:SS[Z]');
    return this.http.get<PrecipitationDayDataNew[]>(`${this.url}/data?dateInstant=${formattedDate}`);
  }

  draw(date: Date): void {
    this.putMarkers(
      this.getStations(),
      this.getDataFromDateAsObservableUsingInstant(date),
      this.info.metricLabel
    );
  }

  getInfo(): void {
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => this.info = info);
  }

  getInfoSubscription(): Observable<DataModelBase> {
    return this.http.get<DataModelBase>(`${this.url}/info`);
  }

  clear(): void {
    this.group.clearLayers();
  }
}
