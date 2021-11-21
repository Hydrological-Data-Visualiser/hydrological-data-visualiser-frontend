import { Component, OnInit } from '@angular/core';
import {DataProviderService} from '../../services/data-provider.service';
import {UniversalMarkerCreatorServiceService} from '../../services/dataType.points/universal-marker-creator-service.service';

@Component({
  selector: 'app-model-configuration',
  templateUrl: './model-configuration.component.html',
  styleUrls: ['./model-configuration.component.css']
})
export class ModelConfigurationComponent implements OnInit {

  url = '';
  constructor(private dataProvider: DataProviderService) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.dataProvider.apis.push(this.url);
    this.dataProvider.getModels();
    this.dataProvider.getUniversalMarkerCreatorService().setUrl(this.url);
  }
}
