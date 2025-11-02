import axios from "axios"
import {ChecklistAssembler} from "./checklist.assembler.js"

export class CheckListApi{
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    checklistsEndpoint = import.meta.env.VITE_CHECKLISTS_ENDPOINT;

    async getCheckListByTaskId(taskId){
        const stringId = String(taskId)
        const endpoint = `${this.baseUrl}${this.checklistsEndpoint}?taskId=${stringId}`
        const response = await axios.get(endpoint)
        if (!response.data || response.data.length === 0) {
            console.warn(`API: No se encontró checklist para taskId=${stringId}`);
            return null;
        }
        return ChecklistAssembler.toEntityFromResponse(response.data[0])
    }
}