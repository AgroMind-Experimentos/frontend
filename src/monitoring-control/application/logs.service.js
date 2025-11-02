import {LogsApi} from '../infrastructure/logs-api.js'

export class LogsService{
    constructor(){
        this.logsApi = new LogsApi()
    }
    async getLogs(){
        return await this.logsApi.getLogs()
    }
}