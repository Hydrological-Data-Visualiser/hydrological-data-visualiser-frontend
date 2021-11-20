import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PrecipitationDayDataNew} from '../../model/precipitation-day-data-new';
import {Observable} from 'rxjs';
import {Station} from '../../model/station';
import {MarkerCreatorService} from './marker-creator.service';
import {DataModelBase} from '../../model/data-model-base';
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
  }

  draw(date: Date): void {
    this.getStationsObservable().subscribe(stations => {
      this.putMarkers(
        this.getDistinctLatLongStations(stations),
        this.getDataFromDateAsObservableUsingInstant(date),
        this.info.metricLabel,
        date
      );
    });
  }

  getData(): Observable<PrecipitationDayDataNew[]> {
    return this.http.get<PrecipitationDayDataNew[]>('https://imgw-mock.herokuapp.com/imgw/data');
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
          value.name,
          value.geoId,
          value.latitude,
          value.longitude
        ));
      });
    });
    return stat;
  }

  getDistinctLatLongStations(stations: Station[]): Station[] {
    const tab: number[] = [];
    const retVal: Station[] = [];
    stations.forEach(a => {
      const latitude = a.latitude;
      if (latitude) {
        if (!tab.includes(latitude)) {
          tab.push(latitude);
          retVal.push(a);
        }
      }
    });
    return retVal;
  }

  getMinValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`https://imgw-mock.herokuapp.com/imgw/min?instantFrom=${begin}&length=${length}`);
  }

  getMaxValue(begin: string, length: number): Observable<number> {
    return this.http.get<number>(`https://imgw-mock.herokuapp.com/imgw/max?instantFrom=${begin}&length=${length}`);
  }

  // tslint:disable-next-line:ban-types
  setScaleAndColour(begin: string, length: number, callback: Function): void {
    this.getMinValue(begin, length).subscribe(minValue =>
      this.getMaxValue(begin, length).subscribe(maxValue =>
        this.getInfoSubscription().subscribe(info => {
          this.colorService.setColorMap(minValue, maxValue, info.minColour, info.maxColour, info.metricLabel);
          callback();
        })
      )
    );
  }
}