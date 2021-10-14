import { HydrologicalDataBase } from './hydrological-data-base';

export class PrecipitationDayDataNew implements HydrologicalDataBase {

  constructor(
    public id: number,
    public stationId: number,
    public stationName: string,
    public date: Date,
    public dailyPrecipitation: number
  ) {
  }
}
