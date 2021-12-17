export class EmitData {
  constructor(
    public name?: string,
    public latitude?: number,
    public longitude?: number,
    public date?: Date,
    public value?: number,
    public metricLabel?: string
  ) {
  }
}
