import {DataType} from './data-type';

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
  ) {
  }
}
