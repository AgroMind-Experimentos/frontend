import {CheckList} from '../domain/model/checklist.entity.js'
import {ItemAssembler} from './item.assembler.js'

export class ChecklistAssembler{
    static toEntityFromResponse(response){
        return new CheckList({
            id: response.id,
            taskId: response.taskId,
            title: response.title,
            items: response.items.map(item=>ItemAssembler.toEntityFromResponse(item))
        })
    }
}