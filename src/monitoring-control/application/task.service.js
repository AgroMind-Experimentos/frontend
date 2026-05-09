import {TaskApi} from '../infrastructure/task-api.js'
import axios from "axios";

export class TaskService {
    constructor() {
        this.taskApi = new TaskApi()
    }

    async getTasksCompleted(filters = {}){
        return await this.taskApi.getTasksCompleted(filters)
    }

    async getTasksInProgress(filters = {}){
        return await this.taskApi.getTasksInProgress(filters)
    }

    async getTasksPending(filters = {}){
        return await this.taskApi.getTasksPending(filters)
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

    async registerNewTask(task){
        return await this.taskApi.registerNewTask(task);
    }

    async deleteTask(taskId) {
        return await this.taskApi.deleteTask(taskId);
    }
}