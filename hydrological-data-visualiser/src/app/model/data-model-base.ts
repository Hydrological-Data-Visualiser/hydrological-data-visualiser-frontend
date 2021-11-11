import {DataType} from './data-type';
import {HydrologicalDataBase} from './hydrological-data-base';

export class DataModelBase {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public dataType: DataType,
    public availableDates: Date[],
    public metricLabel: string,
    public minColour: string,
    public maxColour: string
    // public values: HydrologicalDataBase[] = []
    /*
    place for other information about data model, TBD in the future
    */
  ) {
  }
}
