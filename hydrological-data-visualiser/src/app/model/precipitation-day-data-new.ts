export class PrecipitationDayDataNew {
  constructor(
    public id: number,
    public stationId: number,
    public stationName: string,
    public date: Date,
    public dailyPrecipitation: number
  ) {
  }
}
