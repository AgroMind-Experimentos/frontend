export class Task{
    constructor({id, title, organizationId, responsibleId, status, startedAt, completedAt}){
        this.id = id
        this.title = title
        this.organizationId = organizationId
        this.responsibleId = responsibleId
        this.status = status
        this.startedAt = startedAt
        this.completedAt = completedAt
    }
}