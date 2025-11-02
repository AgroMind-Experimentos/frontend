import axios from 'axios'
import {LogsAssembler} from "./logs.assembler.js"

export class LogsApi{
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    logsEndpoint = import.meta.env.VITE_LOGS_ENDPOINT;

    async getLogs(){
        try{
            const endpoint = `${this.baseUrl}${this.logsEndpoint}`
            const response = await axios.get(endpoint)
            return response.data.map((log)=>LogsAssembler.toEntityFromResponse(log))
        }catch(error){
            console.log(error)
        }
    }
}