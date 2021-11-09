import {Component, OnInit} from '@angular/core';
import {DataModelBase} from '../../model/data-model-base';
import {DataProviderService} from '../../services/data-provider.service';

@Component({
  selector: 'app-data-model',
  templateUrl: './data-model.component.html',
  styleUrls: ['./data-model.component.css']
})
export class DataModelComponent implements OnInit {

  constructor(private dataProvider: DataProviderService) {
  }

  ngOnInit(): void {
  }

  getModels(): DataModelBase[] {
    return this.dataProvider.getModels();
  }

  getModelStatus(modelName: string): boolean {
    switch (modelName) {
      case 'IMGW':
        return this.dataProvider.getPrecipitationService().status;
      case 'river':
        return this.dataProvider.getRiverService().status;
      case 'riverPressure':
        return this.dataProvider.getKocinkaSurfaceHeightService().status;
      default:
        return false;
    }
  }

  changeModelStatus(modelName: string, status: boolean): void {
    switch (modelName) {
      case 'IMGW':
        this.dataProvider.getPrecipitationService().status = status;
        break;
      case 'river':
        this.dataProvider.getRiverService().status = status;
        break;
      case 'riverPressure':
        this.dataProvider.getKocinkaSurfaceHeightService().status = status;
        break;
    }
  }
}
