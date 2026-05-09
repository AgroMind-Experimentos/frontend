import {Task} from '../domain/model/task.entity.js'

export class TaskAssembler {
    static toEntityFromResponse(response){
        return new Task({
            id: response.id,
            title: response.title,
            organizationId: response.organizationId,
            responsibleId: response.responsibleId,
            status: response.status,
            startedAt: response.startedAt,
            completedAt: response.completedAt,
        })
    }

    static toEntityFromResource(resource){
        return new Task({
            id: resource.id || Date.now().toString(),
            title: resource.title,
            organizationId: resource.organizationId,
            responsibleId: resource.responsibleId,
            status: resource.status,
            startedAt: resource.startedAt,
            completedAt: resource.completedAt,
        })
    }
}