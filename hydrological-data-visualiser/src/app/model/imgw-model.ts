import {DataModelBase} from './data-model-base';
import {DataType} from './data-type';
import {PrecipitationDayDataNew} from './precipitation-day-data-new';

export class ImgwModel implements DataModelBase{
  constructor(
    public modelName: string,
    public description: string,
    public dataType: DataType,
    public data: PrecipitationDayDataNew[]
  ) {
  }
}
