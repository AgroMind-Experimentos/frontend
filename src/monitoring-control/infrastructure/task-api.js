import axios from 'axios'
import {TaskAssembler} from "./task.assembler.js"

export class TaskApi{
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    tasksEndpoint = import.meta.env.VITE_TASKS_ENDPOINT;

    async getTasksCompleted(){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}?status=Completed`;
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch(error){
            console.log(error)
        }
    }

    async getTasksInProgress(){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}?status=InProgress`;
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch(error){
            console.log(error)
        }
    }

    async getTasksPending(){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}?status=Pending`;
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch (error){
            console.log(error)
        }
    }

    async updateStatus(taskID, newStatus){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${taskID}/status`
        try{
            const response = await axios.patch(endpoint, {status: newStatus})
            return response.data
        }catch(error){
            console.log(error)
        }
    }

    async updateCompletedDate(taskID, newCompletedDate){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${taskID}`
        try{
            const response = await axios.patch(endpoint, {completedAt: newCompletedDate})
            return response.data
        }catch(error){
            console.log(error)
        }
    }

    async updateStartedDate(taskId, newStartedDate){
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${taskId}`
        try{
            const response = await axios.patch(endpoint, {startedAt: newStartedDate})
            return response.data
        }catch(error){
            console.log(error)
        }
    }

    async getTaskById(taskId){
        const stringId = String(taskId)
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${stringId}`
        try{
            const response = await axios.get(endpoint);
            return TaskAssembler.toEntityFromResponse(response.data)
        }catch(error){
            console.log(error)
        }
    }

    async registerNewTask(resource) {
        try {
            const endpoint = `${this.baseUrl}${this.tasksEndpoint}`;
            const payload = {
                Title: resource.title.trim(),
                ResponsibleId: resource.responsibleId,
            };

            console.log("Payload FINAL enviado:", payload);

            const response = await axios.post(endpoint, payload);
            console.log("Tarea creada correctamente:", response.data);
            return response.data;

        } catch (error) {
            console.error("ERROR FINAL:", error.response?.data || error.message);
            return false;
        }
    }
}