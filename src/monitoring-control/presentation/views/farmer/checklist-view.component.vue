<script setup lang="js">
import {CheckListService} from '../../../application/checklist.service.js'
import {TaskService} from '../../../application/task.service.js'
import {onMounted, ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { userStore } from '../../../../iam/application/user.store.js'

const route = useRoute()
const router = useRouter()
const checklist = ref(null)
const checkedItems = ref({})
const checkListService = new CheckListService()
const taskId = route.params.id
const taskService = new TaskService()
const task = ref(null)
const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist')
const completeError = ref('')

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
  } catch(error) {
    console.error(error)
    completeError.value = 'Error al completar la tarea. Intenta de nuevo.'
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
    <h3>{{ $t('tasksExt.checklist') }}</h3>
    <div v-if="checklist && checklist.items && checklist.items.length > 0">
      <div v-for="item in checklist.items" :key="item.id" class="checklist-item">
        <template v-if="task?.status?.toLowerCase() === 'pending'">
          <pv-checkbox :modelValue="false" :inputId="`check-${item.id}`" :binary="true" class="checkbox" :disabled="true"></pv-checkbox>
          <label :for="`check-${item.id}`" class="checklist-name">{{ item.description }}</label>
        </template>
        <template v-else>
          <pv-checkbox v-model="checkedItems[item.id]" :inputId="`check-${item.id}`" :binary="true" class="checkbox" :disabled="isAgronomist || task?.status === 'Completed'"></pv-checkbox>
          <label :for="`check-${item.id}`" class="checklist-name">{{ item.description }}</label>
        </template>
      </div>
    </div>
    <div v-else>
      <p v-if="checklist === null">{{ $t('common.loading') }}</p>
      <p v-else-if="task?.status?.toLowerCase() !== 'pending'" class="no-checklist">{{ $t('tasksExt.noChecklist') }}</p>
    </div>

    <p v-if="completeError" class="complete-error">{{ completeError }}</p>

    <pv-button
      v-if="!isAgronomist && task?.status?.toLowerCase() !== 'pending'"
      @click="finishTask"
      class="finish-btn"
      :disabled="task?.status === 'Completed'"
    >{{ $t('tasks.finish') }}</pv-button>
  </div>
</template>

<style scoped>
.container {
  width: 80%;
  margin: 2rem auto;
  padding: 2.5rem;
  background: #f7f9fc;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  text-align: center;
  animation: fadeIn 0.4s ease;
  color: #222 !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.container h3 {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

/* Cada ítem */
.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.7rem 0;
  padding: 0.8rem 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e1e1e1;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.checklist-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}

.checklist-name {
  font-size: 1.1rem;
  color: #444;
}

/* Checkbox personalizado PrimeVue */
.checkbox {
  transform: scale(1.3);
}

/* Caja del checkbox */
:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #222 !important;
  background-color: #fff !important;
}

/* Check activo */
:deep(.p-checkbox.p-checkbox-checked .p-checkbox-box),
:deep(.p-checkbox.p-checked .p-checkbox-box),
:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  border-color: #ff9900 !important;
  background-color: #fff !important;
}

/* Icono del check */
:deep(.p-checkbox .p-checkbox-icon) {
  color: #ff9900 !important;
}

/* Hover del checkbox */
:deep(.p-checkbox:hover .p-checkbox-box) {
  border-color: #ff9900 !important;
}

.no-checklist {
  color: #9ca3af;
  font-style: italic;
  margin: 1rem 0;
}

.complete-error {
  color: #991b1b;
  background: #fee2e2;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin: 0.75rem 0;
  font-size: 0.9rem;
}

/* Botón Finalizar */
.finish-btn {
  margin: 3rem auto 0 auto;
  width: 60%;
  padding: 0.9rem;
  font-size: 1.2rem;
  border-radius: 12px;
  background-color: #ff9900 !important;
  color: white !important;
  border: none !important;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.finish-btn:hover {
  background-color: #df8600 !important;
  transform: scale(1.02);
}

.finish-btn:disabled {
  background-color: #bbbbbb !important;
  cursor: not-allowed;
  transform: none;
}
</style>
