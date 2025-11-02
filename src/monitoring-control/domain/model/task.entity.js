export class Task{
    constructor({taskID, title, responsibleId, status, startedAt, completedAt}){
        this.taskID = taskID
        this.title = title
        this.responsibleId = responsibleId
        this.status = status
        this.startedAt = startedAt
        this.completedAt = completedAt
    }
}