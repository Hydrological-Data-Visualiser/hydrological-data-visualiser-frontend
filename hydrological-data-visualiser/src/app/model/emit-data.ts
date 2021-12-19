import {Station} from './station';

export class EmitData {
  constructor(
    public station?: Station,
    public latitude?: number,
    public longitude?: number,
    public date?: Date,
    public value?: number,
    public metricLabel?: string
  ) {
  }
}
