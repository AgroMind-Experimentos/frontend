import {TaskApi} from '../infrastructure/task-api.js'
import axios from "axios";

export class TaskService {
    constructor() {
        this.taskApi = new TaskApi()
    }

    async getTasksCompleted(){
        return await this.taskApi.getTasksCompleted()
    }

    async getTasksInProgress(){
        return await this.taskApi.getTasksInProgress()
    }

    async getTasksPending(){
        return await this.taskApi.getTasksPending()
    }

    async updateStatus(taskID, status){
        return await this.taskApi.updateStatus(taskID, status)
    }

    async updateCompletedDate(taskId, completionDate) {
        return await this.taskApi.updateCompletedDate(taskId, completionDate);
    }

    async updateStartedDate(taskId, newStartedDate){
        return await this.taskApi.updateStartedDate(taskId, newStartedDate);
    }

    async getTaskById(taskId){
        return await this.taskApi.getTaskById(taskId);
    }
}