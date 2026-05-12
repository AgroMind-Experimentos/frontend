export class Items{
    constructor({id, description, isCompleted = false}){
        this.id = id;
        this.description = description;
        this.isCompleted = isCompleted;
    }
}