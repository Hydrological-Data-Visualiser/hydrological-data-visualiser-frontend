import {DataType} from './data-type';

export interface DataModelBase {
  modelName: string;
  description: string;
  dataType: DataType;
  /*
  place for other information about data model, TBD in the future
   */
}
