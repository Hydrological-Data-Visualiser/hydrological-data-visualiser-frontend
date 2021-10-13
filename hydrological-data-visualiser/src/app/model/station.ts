export class Station {
  constructor(
    public id: number,
    public name: string,
    public geoId: number,
    public latitude?: number,
    public longitude?: number
  ) {
  }
}
