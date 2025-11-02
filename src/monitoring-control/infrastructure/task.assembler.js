import {Task} from '../domain/model/task.entity.js'

export class TaskAssembler {
    static toEntityFromResponse(response){
        return new Task({
            taskID: response.id,
            title: response.title,
            responsibleId: response.responsibleId,
            status: response.status,
            startedAt: response.startedAt,
            completedAt: response.completedAt,
        })
    }
}