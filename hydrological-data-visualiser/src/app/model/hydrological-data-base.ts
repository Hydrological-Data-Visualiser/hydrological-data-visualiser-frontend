export class HydrologicalDataBase {

  constructor(
    public id: number,
    public stationId: number,
    public date: Date,
    public value: number
  ) {}
  }
