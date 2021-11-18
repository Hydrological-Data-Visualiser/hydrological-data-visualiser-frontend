export class EmitData {

  constructor(
    public stationName?: string,
    public latitude?: number,
    public longitude?: number,
    public date?: Date,
    public value?: number,
    public metricLabel?: string
  ) {
  }
}
