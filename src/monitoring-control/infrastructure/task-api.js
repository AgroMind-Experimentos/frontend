import axios from 'axios'
import {TaskAssembler} from "./task.assembler.js"

export class TaskApi{
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    tasksEndpoint = import.meta.env.VITE_TASKS_ENDPOINT;

    #buildUrl(status, filters = {}) {
        const params = new URLSearchParams({ status })
        if (filters.responsibleId) params.append('responsibleId', filters.responsibleId)
        if (filters.organizationId) params.append('organizationId', filters.organizationId)
        return `${this.baseUrl}${this.tasksEndpoint}?${params.toString()}`
    }

    async getTasksCompleted(filters = {}){
        const endpoint = this.#buildUrl('Completed', filters)
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch(error){
            console.log(error)
            return []
        }
    }

    async getTasksInProgress(filters = {}){
        const endpoint = this.#buildUrl('InProgress', filters)
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch(error){
            console.log(error)
            return []
        }
    }

    async getTasksPending(filters = {}){
        const endpoint = this.#buildUrl('Pending', filters)
        try{
            const response = await axios.get(endpoint);
            return response.data.map(task=> TaskAssembler.toEntityFromResponse(task))
        }catch (error){
            console.log(error)
            return []
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
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}`;
        const payload = {
            Title: resource.title.trim(),
            Description: resource.description?.trim() || '',
            OrganizationId: Number(resource.organizationId),
            CropId: Number(resource.cropId),
            ResponsibleId: Number(resource.responsibleId),
        };
        const response = await axios.post(endpoint, payload);
        return response.data;
    }

    async updateTask(taskId, data) {
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${taskId}`;
        try {
            await axios.put(endpoint, {
                Title: data.title.trim(),
                Description: data.description?.trim() || '',
                ResponsibleId: Number(data.responsibleId)
            });
            return true;
        } catch (error) {
            console.error('Error actualizando tarea:', error);
            throw error;
        }
    }

    async deleteTask(taskId) {
        const endpoint = `${this.baseUrl}${this.tasksEndpoint}/${taskId}`;
        try {
            await axios.delete(endpoint);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
}