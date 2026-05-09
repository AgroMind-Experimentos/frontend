<script setup lang="js">
import {TaskService} from '../../../application/task.service.js'
import {ref, computed, onMounted} from "vue"
import {useRouter} from "vue-router"
import { userStore } from '../../../../iam/application/user.store.js'
import { organizationService } from '../../../../organization/application/organization.service.js'
import { UserProfileApi } from '../../../../profile/infrastructure/user-profile-api.js'

const taskService = new TaskService()
const profileApi = new UserProfileApi()
const tasks = ref([])
const userMap = ref({})
const loading = ref(true)
const loadError = ref('')
const router = useRouter()
const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist')

function userName(id) {
  return userMap.value[id] || `#${id}`
}

function orgName(id) {
  const org = organizationService.state.organizations.find(o => o.id === id)
  return org?.name || null
}

function buildFilters() {
  if (!isAgronomist.value) {
    return { responsibleId: userStore.state.user?.id }
  }
  const orgIds = organizationService.state.organizations.map(o => o.id)
  if (orgIds.length === 0) return null
  return { organizationId: orgIds[0] }
}

onMounted(async () => {
  try{
    if (isAgronomist.value && organizationService.state.organizations.length === 0)
      await organizationService.getAllOrganizations()
    const filters = buildFilters()
    if (filters === null) { tasks.value = []; return }
    const [taskList, allUsers] = await Promise.all([
      taskService.getTasksCompleted(filters),
      profileApi.getAllUsers()
    ])
    tasks.value = taskList
    if (Array.isArray(allUsers))
      allUsers.forEach(u => { userMap.value[u.id] = u.displayName || u.firstName || `#${u.id}` })
  } catch(error) {
    console.error('Error loading completed tasks:', error)
    loadError.value = 'No se pudieron cargar las tareas. Intenta de nuevo.'
  } finally{
    loading.value = false
  }
})

function goToCheckList(taskId){
  router.push(`/tasks/in-progress/${taskId}/checklist`)
}

async function deleteTask(task) {
  if (!confirm(`¿Eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`)) return
  try {
    await taskService.deleteTask(task.id)
    tasks.value = tasks.value.filter(t => t.id !== task.id)
  } catch (error) {
    console.error('Error al eliminar la tarea:', error)
    alert('Error al eliminar la tarea. Intenta de nuevo.')
  }
}

function formatDate(dateString){
  if(!dateString){
    return 'N/A'
  }
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<template>
  <div class="container">
    <h3>Tareas Completadas</h3>

    <div v-if="loadError" class="load-error">
      <i class="pi pi-exclamation-triangle"></i> {{ loadError }}
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Cargando tareas...</span>
    </div>

    <div v-else-if="tasks.length > 0" class="tasks">
      <div class="task-card" v-for="task in tasks" :key="task.id">
        <div class="task-content">
          <div class="task-info">
            <h4 class="task-title">{{ task.title }}</h4>
            <p class="task-meta" v-if="orgName(task.organizationId)">
              <i class="pi pi-sitemap"></i> {{ orgName(task.organizationId) }}
            </p>
            <p class="task-meta">Responsable: {{ userName(task.responsibleId) }}</p>
            <p class="task-meta" v-if="task.completedAt">Completada: {{ formatDate(task.completedAt) }}</p>
            <div class="status-badge completed">
              <i class="pi pi-check"></i>
              Completada
            </div>
          </div>
          <div class="task-actions">
            <button
              class="icon-btn details"
              title="Ver checklist"
              @click="goToCheckList(task.id)"
            >
              <i class="pi pi-eye"></i>
            </button>
            <button
              v-if="isAgronomist"
              class="icon-btn delete"
              title="Eliminar tarea"
              @click="deleteTask(task)"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-check-circle empty-icon"></i>
      <h3>No hay tareas completadas</h3>
      <p>Completa algunas tareas para verlas aquí</p>
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
  border-left: 4px solid #28a745;
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

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.status-badge.completed {
  background-color: #d4edda;
  color: #155724;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: white;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.icon-btn:hover {
  transform: scale(1.12);
  opacity: 0.9;
}

.icon-btn.details { background-color: #28a745; }
.icon-btn.delete  { background-color: #dc3545; }

.load-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  color: #28a745;
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