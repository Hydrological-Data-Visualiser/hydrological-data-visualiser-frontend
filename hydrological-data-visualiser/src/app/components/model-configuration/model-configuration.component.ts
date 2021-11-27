import { Component, OnInit } from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import {DataType} from '../../model/data-type';
import {DataModelBase} from '../../model/data-model-base';
import {HttpClient} from '@angular/common/http';
import {concatMap} from 'rxjs/operators';
import {of, pipe} from 'rxjs';

@Component({
  selector: 'app-model-configuration',
  templateUrl: './model-configuration.component.html',
  styleUrls: ['./model-configuration.component.css']
})
export class ModelConfigurationComponent implements OnInit {

  url = '';
  public dataModelBase!: DataModelBase;
  constructor(private dataProvider: DataProviderService, public http: HttpClient) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.dataProvider.apis.push(this.url);
    this.dataProvider.getModels();
    this.http.get<DataModelBase>(`${this.url}/info`).subscribe(info => {
      switch (info.dataType) {
        case DataType.LINE: {
          this.dataProvider.getUniversalLineService().setUrl(this.url);
          break;
        }
        case DataType.POINTS: {
          this.dataProvider.getUniversalMarkerCreatorService().setUrl(this.url);
          break;
        }
        case DataType.POLYGON: {
          this.dataProvider.getUniversalPolygonsService().setUrl(this.url);
          break;
        }
      }
    });
    // @ts-ignore -
    document.getElementById('dismissButtonModalLabel').click();
  }
}
