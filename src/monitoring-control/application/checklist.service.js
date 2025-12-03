import {CheckListApi} from '../infrastructure/checklist-api.js'

export class CheckListService{
    constructor(){
        this.checkListApi = new CheckListApi()
    }

    async getChecklistByTaskId(taskId){
        return  await  this.checkListApi.getCheckListByTaskId(taskId)
    }

    async registerNewChecklist(checklist){
        return await  this.checkListApi.registerNewChecklist(checklist)
    }
}