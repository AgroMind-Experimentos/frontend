import axios from "axios"
import {ChecklistAssembler} from "./checklist.assembler.js"

export class CheckListApi{
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    checklistsEndpoint = import.meta.env.VITE_CHECKLISTS_ENDPOINT;

    async getCheckListByTaskId(taskId){
        const stringId = String(taskId)
        const endpoint = `${this.baseUrl}${this.checklistsEndpoint}?taskId=${stringId}`
        try{
            const response = await axios.get(endpoint);
            if(response.data.message === "Checklist not found"){
                return null;
            }
            const data = Array.isArray(response.data.data) ? response.data[0] : response.data;
            return ChecklistAssembler.toEntityFromResponse(data);
        }catch (error){
            if(error.response?.status === 404 || error.response?.data?.message){
                return null;
            }
            console.error("Error cargando las checklists: ", error);
            throw error;
        }
    }

    async updateChecklist(checklistId, items) {
        try {
            const endpoint = `${this.baseUrl}${this.checklistsEndpoint}/${checklistId}`;
            const payload = {
                items: items.map(item => ({
                    description: (item.description || item.Description || '').trim()
                })).filter(i => i.description)
            };
            await axios.put(endpoint, payload);
            return true;
        } catch (error) {
            console.error('Error actualizando checklist:', error.response?.data || error.message);
            throw error;
        }
    }

    async markItemCompleted(itemId, isCompleted) {
        try {
            const endpoint = `${this.baseUrl}${this.checklistsEndpoint}/items/${itemId}`;
            await axios.patch(endpoint, { isCompleted });
            return true;
        } catch (error) {
            console.error('Error marcando ítem:', error.response?.data || error.message);
            throw error;
        }
    }

    async registerNewChecklist(resource) {
        try {
            const endpoint = `${this.baseUrl}${this.checklistsEndpoint}`;
            const items = Array.isArray(resource.items) ? resource.items : [];
            const payload = {
                TaskId: String(resource.taskId),
                Title: resource.title?.trim() || "Checklist",
                Items: items.map(item => ({
                    Description: (item.description || item.Description || "").trim()
                })).filter(i => i.Description)
            };
            console.log("CHECKLIST PAYLOAD FINAL ENVIADO:", payload);
            await axios.post(endpoint, payload);
            return true;
        } catch (error) {
            console.error("ERROR CREANDO CHECKLIST:", error.response?.data || error.message);
            return false;
        }
    }
}