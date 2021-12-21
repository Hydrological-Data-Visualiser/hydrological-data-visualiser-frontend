import {Component, OnInit} from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import {DataType} from '../../model/data-type';
import {DataModelBase} from '../../model/data-model-base';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-model-configuration',
  templateUrl: './model-configuration.component.html',
  styleUrls: ['./model-configuration.component.css']
})
export class ModelConfigurationComponent implements OnInit {
  url = '';
  urlAdded = false;
  public dataModelBase!: DataModelBase;
  constructor(private dataProvider: DataProviderService, public http: HttpClient) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.urlAdded = false;
    this.checkIfUrlAlreadyAdded();
    if (!this.urlAdded) {
      const urlCopy = this.url;
      this.dataProvider.apis.push(urlCopy);
      this.http.get<DataModelBase>(`${urlCopy}/info`).subscribe(data => {
        this.dataProvider.addedModelUrls.set(data.name, urlCopy);
        switch (data.dataType) {
          case DataType.LINE: {
            this.dataProvider.addedModels.set(data.name, DataType.LINE);
            this.dataProvider.getUniversalLineService().setUrl(urlCopy);
            break;
          }
          case DataType.POINTS: {
            this.dataProvider.addedModels.set(data.name, DataType.POINTS);
            this.dataProvider.getUniversalMarkerCreatorService().setUrl(urlCopy);
            break;
          }
          case DataType.POLYGON: {
            this.dataProvider.addedModels.set(data.name, DataType.POLYGON);
            this.dataProvider.getUniversalPolygonsService().setUrl(urlCopy);
            break;
          }
        }
      }, error => {
        console.log('cannot get ' + urlCopy + '/info.');
        this.dataProvider.apis.pop();
      });
      this.dataProvider.getModels();
      // @ts-ignore -
      document.getElementById('dismissButtonModalLabel').click();
    }
    this.url = '';
  }

  checkIfUrlAlreadyAdded(): void {
    this.dataProvider.apis.forEach(api => this.urlAdded = this.urlAdded || (api === this.url));
  }
}
