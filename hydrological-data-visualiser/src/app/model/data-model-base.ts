import {DataType} from './data-type';
import {HydrologicalDataBase} from './hydrological-data-base';

export class DataModelBase {
  constructor(
    public modelName: string,
    public description: string,
    public dataType: DataType,
    public values: HydrologicalDataBase[]
    /*
    place for other information about data model, TBD in the future
    */
  ) {
  }
}
