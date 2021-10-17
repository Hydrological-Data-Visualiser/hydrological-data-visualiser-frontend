import {DataModelBase} from './data-model-base';

export class ImgwModel implements DataModelBase{
  constructor(
    public modelName: string,
    public dataType: DataType,
    public data: {}
  ) {
  }
}
