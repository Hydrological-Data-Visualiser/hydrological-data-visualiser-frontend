export class PreciptationDayDataNew {
  constructor(
    public id: number,
    public stationId: number,
    public stationName: string,
    public date: Date,
    public dailyPrecipitation: number
  ) {
  }
}
