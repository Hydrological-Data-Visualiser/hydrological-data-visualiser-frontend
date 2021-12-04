import {ApplicationRef, Component, OnInit} from '@angular/core';
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
      this.dataProvider.apis.push(this.url);
      this.http.get<DataModelBase>(`${this.url}/info`).subscribe(data => {
        switch (data.dataType) {
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
      }, error => {
        console.log('cannot get ' + this.url + '/info.');
        this.dataProvider.apis.pop();
      });
      this.dataProvider.getModels();
      // @ts-ignore -
      document.getElementById('dismissButtonModalLabel').click();
    }
  }

  checkIfUrlAlreadyAdded(): void {
    this.dataProvider.apis.forEach(api => this.urlAdded = this.urlAdded || (api === this.url));
  }
}
