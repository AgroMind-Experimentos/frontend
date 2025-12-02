export class Task{
    constructor({id, title, responsibleId, status, startedAt, completedAt}){
        this.id = id
        this.title = title
        this.responsibleId = responsibleId
        this.status = status
        this.startedAt = startedAt
        this.completedAt = completedAt
    }
}