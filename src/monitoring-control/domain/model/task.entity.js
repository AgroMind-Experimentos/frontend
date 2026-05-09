export class Task{
    constructor({id, title, description, organizationId, responsibleId, status, startedAt, completedAt}){
        this.id = id
        this.title = title
        this.description = description || ''
        this.organizationId = organizationId
        this.responsibleId = responsibleId
        this.status = status
        this.startedAt = startedAt
        this.completedAt = completedAt
    }
}