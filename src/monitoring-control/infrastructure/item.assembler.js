import {Items} from '../domain/model/items.entity.js'

export class ItemAssembler{
    static toEntityFromResponse(response){
        return new Items({
            id: response.id,
            description: response.description
        })
    }
}