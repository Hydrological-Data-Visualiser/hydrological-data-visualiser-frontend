export class PreciptationDayData {
    constructor(
        public stationID: number,
        public stationName: string,
        public year: string,
        public month: string,
        public day: string,
        public precipitation: number
    ) {}
}
