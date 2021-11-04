import { HydrologicalDataBase } from './hydrological-data-base';

export class PrecipitationDayDataNew extends HydrologicalDataBase {

  constructor(
    public id: number,
    public stationId: number,
    public date: Date,
    public value: number,
    public dailyPrecipitation: number
  ) {
    super(id, stationId, date, value);
  }
}
