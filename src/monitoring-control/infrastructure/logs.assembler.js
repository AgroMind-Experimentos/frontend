import {Logs} from '../domain/model/logs.entity.js'

export class LogsAssembler {
    static toEntityFromResponse(response){
        return new Logs({
            id: response.id,
            activity: response.activity,
            date: response.date,
            duration: response.duration,
            volume: response.volume,
            evidence: response.evidence,
        });
    }
}