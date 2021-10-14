import {DataModelBase} from './data-model-base';
import {PrecipitationDayDataNew} from './precipitation-day-data-new';

export class ImgwModel implements DataModelBase{
  constructor(
    public modelName: string,
    public data: PrecipitationDayDataNew[]
  ) {
  }
}
