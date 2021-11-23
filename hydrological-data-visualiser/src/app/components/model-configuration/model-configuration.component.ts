import { Component, OnInit } from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import {DataType} from '../../model/data-type';

@Component({
  selector: 'app-model-configuration',
  templateUrl: './model-configuration.component.html',
  styleUrls: ['./model-configuration.component.css']
})
export class ModelConfigurationComponent implements OnInit {

  url = '';
  dataType: DataType | undefined;
  constructor(private dataProvider: DataProviderService) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.dataProvider.apis.push(this.url);
    this.dataProvider.getModels();
    switch (this.dataType) {
      case DataType.LINE: {
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
    // @ts-ignore -
    document.getElementById('dismissButtonModalLabel').click();
  }
}
