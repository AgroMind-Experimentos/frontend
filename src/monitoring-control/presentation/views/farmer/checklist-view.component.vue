<script setup lang="js">
import {CheckListService} from '../../../application/checklist.service.js'
import {TaskService} from '../../../application/task.service.js'
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'

const route = useRoute()
const router = useRouter()
const checklist = ref(null)
const checkedItems = ref({})
const checkListService = new CheckListService()
const taskId = route.params.id
const taskService = new TaskService()
const task = ref(null)

onMounted(async ()=>{
  const taskResponse = await taskService.getTaskById(taskId)
  if(taskResponse){
    task.value = taskResponse
  }
  const response = await checkListService.getChecklistByTaskId(taskId)
  if (response) {
    checklist.value = response
    if (checklist.value.items && checklist.value.items.length > 0) {
      checklist.value.items.forEach(item=>{
        checkedItems.value[item.id] = false
      })
    }
    if(task.value.status?.toLowerCase() === "completed"){
      checklist.value.items.forEach(item => {
        checkedItems.value[item.id] = true;
      });
    }
  } else {
    console.warn('No se encontró checklist para esta tarea:', taskId)
    checklist.value = {}
  }
})

async function completeTask(){
  try{
    const numericID = Number(taskId)
    const now = new Date();
    const completedAt = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(now);
    await taskService.updateCompletedDate(numericID, completedAt);
    await taskService.updateStatus(numericID, 'Completed');
    task.value.status = "Completed"
    await router.push('/tasks/in-progress')
  }catch(error){
    console.log(error)
  }
}

const finishTask = ()=>{
  if(task.value?.status === "Completed"){
    alert("This monitoring-control is already completed")
    return
  }
  const allChecked = Object.values(checkedItems.value).every(val => val === true)
  if(!allChecked){
    alert("Complete all tasks")
  }else{
    alert("Task Completed")
    completeTask()
  }
}
</script>

<template>
  <div class="container">
    <h3>CheckList</h3>
    <div v-if="checklist && checklist.items && checklist.items.length > 0">
      <div v-for="item in checklist.items" :key="item.id" class="checklist-item">
        <pv-checkbox v-model="checkedItems[item.id]" :inputId="`check-${item.id}`" :binary="true" class="checkbox" :disabled="task?.status === 'Completed'"></pv-checkbox>
        <label :for="`check-${item.id}`" class="checklist-name">{{item.description}}</label>
      </div>
      <pv-button @click="finishTask" class="finish-btn" :disabled="task?.status === 'Completed'">Finalizar</pv-button>
    </div>
    <div v-else>
      <p v-if="checklist === null">No se encontraron checklists</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  box-shadow: 1px 1px 7px rgb(218, 218, 218) !important;
  text-align: center;
  height: 100%;
}
.checklist-item {
  align-items: center;
  margin: 0.5rem;
  display: flex;
  justify-content: left;
}
.checkbox{
  margin-right: 1rem;
}
.container h3{
  margin-top: 2rem;
}
.finish-btn{
  margin: 3rem auto 0 auto;
  width: 50%;
  background-color: #FF9900 !important;
  border: none !important;
  color: white !important;
  border-radius: 10px;
  outline: none;
}
.finish-btn:hover{
  background-color: #df8600 !important;
}
:deep(.p-checkbox .p-checkbox-box) {
  border: 1px solid black !important;
  background-color: transparent !important;
  transition: all 0.2s ease;
}

/* Para todas las versiones de PrimeVue */
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box),
:deep(.p-checkbox.p-checked .p-checkbox-box),
:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background-color: white !important;
  border-color: black !important;
}

/* Ícono (check) en color blanco */
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-icon),
:deep(.p-checkbox.p-checked .p-checkbox-icon),
:deep(.p-checkbox .p-checkbox-box.p-highlight .p-checkbox-icon) {
  color: white !important;
}

/* Hover */
:deep(.p-checkbox:hover .p-checkbox-box) {
  border-color: #df8600 !important;
}
</style>