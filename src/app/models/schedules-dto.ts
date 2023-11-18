export class SchedulesDTO {

    gameId: string;
    gameNumber: number;
    seasonId: string;
    year: number;
    type: string;
    dayNight: string;
    duration: string;
    durationMinutes: number;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamId: string;
    awayTeamName: string;
    startTime: string;
    attendance: number;
    status: string;
    created: string;

    constructor() {
        this.gameId = '';
        this.gameNumber = 0;
        this.seasonId = '';
        this.year = 0;
        this.type = '';
        this.dayNight = '';
        this.duration = '';
        this.durationMinutes = 0;
        this.homeTeamId = '';
        this.homeTeamName = '';
        this.awayTeamId = '';
        this.awayTeamName = '';
        this.startTime = '';
        this.attendance = 0;
        this.status = '';
        this.created = '';
    }
}
