import { HydrologicalDataBase } from './hydrological-data-base';

export class PrecipitationDayDataNew extends HydrologicalDataBase {

  constructor(
    public id: number,
    public stationId: number,
    public date: Date,
    public dailyPrecipitation: number
    public value: number
  ) {
    super(id, stationId, date, value);
  }
}
