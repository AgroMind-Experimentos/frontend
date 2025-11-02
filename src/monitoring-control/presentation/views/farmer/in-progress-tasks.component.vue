<script setup lang="js">
import {TaskService} from '../../../application/task.service.js'
import {ref, onMounted} from "vue"
import {useRouter} from 'vue-router'

const router = useRouter()
const taskService = new TaskService()
const tasks = ref([])
const loading = ref(true)

onMounted(async () => {
  try{
    tasks.value = await taskService.getTasksInProgress()
  } catch(error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
})

function goToCheckList(taskId){
  router.push(`/tasks/in-progress/${taskId}/checklist`)
}
</script>

<template>
  <div class="container">
    <h3>Tareas en Progreso</h3>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Cargando tareas...</span>
    </div>

    <div v-else-if="tasks.length > 0" class="tasks">
      <div class="task-card" v-for="task in tasks" :key="task.taskID">
        <div class="task-content">
          <div class="task-info">
            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-meta">Responsable: {{ task.responsibleId }}</p>
            <p class="task-meta" v-if="task.startedAt">Iniciada: {{ task.startedAt }}</p>
          </div>
          <div class="task-actions">
            <pv-button
              class="more-button"
              @click="goToCheckList(task.taskID)"
              icon="pi pi-eye"
            >
              Ver detalles
            </pv-button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <h3>No tienes tareas en progreso</h3>
      <p>Todas las tareas están completadas o pendientes</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.container h3 {
  color: #2c5530;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #666;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.task-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
}

.task-info {
  flex: 1;
}

.task-title {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 1.2rem;
}

.task-meta {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.more-button {
  background-color: #FF9900 !important;
  border: none !important;
  border-radius: 8px;
  color: white !important;
  padding: 0.75rem 1.5rem;
}

.more-button:hover {
  background-color: #df8600 !important;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}
</style>