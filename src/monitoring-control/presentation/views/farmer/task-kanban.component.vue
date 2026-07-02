<script setup lang="js">
import { TaskService } from '../../../application/task.service.js'
import { CheckListService } from '../../../application/checklist.service.js'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { userStore } from '../../../../iam/application/user.store.js'
import { organizationService } from '../../../../organization/application/organization.service.js'
import { UserProfileApi } from '../../../../profile/infrastructure/user-profile-api.js'

const checkListService = new CheckListService()
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const taskService = new TaskService()
const profileApi = new UserProfileApi()

const allTasks = ref([])
const userMap = ref({})
const loading = ref(true)
const loadError = ref('')

const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist')
const draggingTaskId = ref(null)

function userName(id) {
  return userMap.value[id] || `#${id}`
}

function buildFilters() {
  if (!isAgronomist.value) {
    return { responsibleId: userStore.state.user?.id }
  }
  const orgIds = organizationService.state.organizations.map(o => o.id)
  if (orgIds.length === 0) return null
  return { organizationId: orgIds[0] }
}

const loadTasks = async () => {
  loading.value = true
  loadError.value = ''
  try {
    if (isAgronomist.value && organizationService.state.organizations.length === 0) {
      await organizationService.getAllOrganizations()
    }
    const filters = buildFilters()
    if (filters === null) {
      allTasks.value = []
      loading.value = false
      return
    }

    const [completedList, inProgressList, pendingList, allUsers] = await Promise.all([
      taskService.getTasksCompleted(filters),
      taskService.getTasksInProgress(filters),
      taskService.getTasksPending(filters),
      profileApi.getAllUsers()
    ])

    // Merge all tasks
    allTasks.value = [...completedList, ...inProgressList, ...pendingList]

    if (Array.isArray(allUsers)) {
      allUsers.forEach(u => {
        userMap.value[u.id] = u.displayName || u.firstName || `#${u.id}`
      })
    }
  } catch (error) {
    console.error('Error loading Kanban board tasks:', error)
    loadError.value = 'No se pudieron cargar las tareas en el tablero Kanban. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTasks()
})

// Columns definitions
const pendingTasksList = computed(() => allTasks.value.filter(t => t.status === 'Pending'))
const inProgressTasksList = computed(() => allTasks.value.filter(t => t.status === 'InProgress'))
const completedTasksList = computed(() => allTasks.value.filter(t => t.status === 'Completed'))

// Drag and drop handlers
const onDragStart = (event, task) => {
  draggingTaskId.value = task.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(task.id))
}

const onDragEnd = () => {
  draggingTaskId.value = null
}

const onDragOver = (event) => {
  event.preventDefault()
}

const onDrop = async (event, newStatus) => {
  event.preventDefault()
  const taskId = event.dataTransfer.getData('text/plain') || draggingTaskId.value
  if (!taskId) return
  await moveTask(Number(taskId), newStatus)
}

// Move Task function
const moveTask = async (taskId, newStatus) => {
  const taskIndex = allTasks.value.findIndex(t => Number(t.id) === Number(taskId))
  if (taskIndex === -1) return
  const task = allTasks.value[taskIndex]
  if (task.status === newStatus) return

  // Prevent moving backward or invalid forward jump
  if (task.status === 'Completed' && newStatus !== 'Completed') {
    toast.add({
      severity: 'warn',
      summary: 'Restricción',
      detail: 'No se puede cambiar el estado de una tarea completada.',
      life: 3000
    })
    return
  }
  if (task.status === 'InProgress' && newStatus === 'Pending') {
    toast.add({
      severity: 'warn',
      summary: 'Restricción',
      detail: 'No se puede regresar una tarea a pendiente.',
      life: 3000
    })
    return
  }
  if (task.status === 'Pending' && newStatus === 'Completed') {
    toast.add({
      severity: 'warn',
      summary: 'Restricción',
      detail: 'Debes iniciar la tarea antes de completarla.',
      life: 3000
    })
    return
  }

  // Prevent completing if checklist has pending items
  if (newStatus === 'Completed') {
    try {
      const checklist = await checkListService.getChecklistByTaskId(taskId)
      if (checklist && checklist.items && checklist.items.length > 0) {
        const hasPendingItems = checklist.items.some(item => !item.isCompleted)
        if (hasPendingItems) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: t('tasks.completeAllTasks') || 'No se puede completar la tarea: el checklist tiene ítems pendientes.',
            life: 4000
          })
          return
        }
      }
    } catch (error) {
      console.error('Error al verificar el checklist:', error)
    }
  }

  const previousStatus = task.status
  const previousStartedAt = task.startedAt
  const previousCompletedAt = task.completedAt

  // Optimistic update
  task.status = newStatus
  if (newStatus === 'InProgress') {
    if (!task.startedAt) {
      task.startedAt = new Date().toISOString()
    }
    task.completedAt = null
  } else if (newStatus === 'Completed') {
    const now = new Date()
    task.completedAt = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(now)
  } else if (newStatus === 'Pending') {
    task.startedAt = null
    task.completedAt = null
  }

  try {
    // API updates
    await taskService.updateStatus(taskId, newStatus)
    if (newStatus === 'InProgress') {
      await taskService.updateStartedDate(taskId, task.startedAt)
      await taskService.updateCompletedDate(taskId, '')
    } else if (newStatus === 'Completed') {
      await taskService.updateCompletedDate(taskId, task.completedAt)
    } else if (newStatus === 'Pending') {
      await taskService.updateStartedDate(taskId, '')
      await taskService.updateCompletedDate(taskId, '')
    }
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Tarea actualizada a ${newStatus === 'InProgress' ? 'En Progreso' : newStatus === 'Completed' ? 'Completado' : 'Pendiente'}`,
      life: 3000
    })
  } catch (error) {
    console.error('Error al actualizar estado:', error)
    // Rollback
    task.status = previousStatus
    task.startedAt = previousStartedAt
    task.completedAt = previousCompletedAt
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado de la tarea.',
      life: 3000
    })
  }
}

// Action helpers
const goToCheckList = (taskId) => {
  router.push(`/tasks/in-progress/${taskId}/checklist`)
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const cleaned = dateString.replace(' ', 'T').replace(/Z$/, '') + 'Z'
    const date = new Date(cleaned)
    if (isNaN(date.getTime())) {
      const fallbackDate = new Date(dateString)
      if (isNaN(fallbackDate.getTime())) return dateString
      return fallbackDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<template>
  <div class="kanban-container">
    <div v-if="loadError" class="load-error">
      <i class="pi pi-exclamation-triangle"></i> {{ loadError }}
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spinner pi-spin"></i>
      <span>Cargando tablero Kanban...</span>
    </div>

    <div v-else>
      <!-- Instructions Banner -->
      <div class="kanban-instructions">
        <i class="pi pi-info-circle"></i>
        <span>{{ $t('tasks.kanbanInstructions') }}</span>
      </div>

      <div class="kanban-board">
        <!-- PENDING COLUMN -->
        <div 
          class="kanban-column pending" 
          @dragover="onDragOver" 
          @drop="onDrop($event, 'Pending')"
        >
          <div class="column-header">
            <div class="header-title">
              <i class="pi pi-pause column-icon"></i>
              <h3>{{ $t('tasks.pending') }}</h3>
            </div>
            <span class="task-count">{{ pendingTasksList.length }}</span>
          </div>

          <div class="column-body">
            <div 
              v-for="task in pendingTasksList" 
              :key="task.id" 
              class="kanban-card pending-border"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="goToCheckList(task.id)"
            >
              <div class="card-title">{{ task.title }}</div>
              <div class="card-desc" v-if="task.description">{{ task.description }}</div>
              
              <div class="card-meta">
                <span class="responsible">
                  <i class="pi pi-user text-xs"></i>
                  {{ userName(task.responsibleId) }}
                </span>
              </div>
            </div>

            <div v-if="pendingTasksList.length === 0" class="empty-column-placeholder">
              <i class="pi pi-inbox"></i>
              <p>No hay tareas pendientes</p>
            </div>
          </div>
        </div>

        <!-- IN PROGRESS COLUMN -->
        <div 
          class="kanban-column in-progress" 
          @dragover="onDragOver" 
          @drop="onDrop($event, 'InProgress')"
        >
          <div class="column-header">
            <div class="header-title">
              <i class="pi pi-clock column-icon"></i>
              <h3>{{ $t('tasks.inProgress') }}</h3>
            </div>
            <span class="task-count">{{ inProgressTasksList.length }}</span>
          </div>

          <div class="column-body">
            <div 
              v-for="task in inProgressTasksList" 
              :key="task.id" 
              class="kanban-card in-progress-border"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="goToCheckList(task.id)"
            >
              <div class="card-title">{{ task.title }}</div>
              <div class="card-desc" v-if="task.description">{{ task.description }}</div>
              
              <div class="card-meta">
                <span class="responsible">
                  <i class="pi pi-user text-xs"></i>
                  {{ userName(task.responsibleId) }}
                </span>
                <span class="date" v-if="task.startedAt">
                  <i class="pi pi-calendar text-xs"></i>
                  {{ formatDate(task.startedAt) }}
                </span>
              </div>
            </div>

            <div v-if="inProgressTasksList.length === 0" class="empty-column-placeholder">
              <i class="pi pi-clock"></i>
              <p>No hay tareas en progreso</p>
            </div>
          </div>
        </div>

        <!-- COMPLETED COLUMN -->
        <div 
          class="kanban-column completed" 
          @dragover="onDragOver" 
          @drop="onDrop($event, 'Completed')"
        >
          <div class="column-header">
            <div class="header-title">
              <i class="pi pi-check-circle column-icon"></i>
              <h3>{{ $t('tasks.completed') }}</h3>
            </div>
            <span class="task-count">{{ completedTasksList.length }}</span>
          </div>

          <div class="column-body">
            <div 
              v-for="task in completedTasksList" 
              :key="task.id" 
              class="kanban-card completed-border"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="onDragEnd"
              @click="goToCheckList(task.id)"
            >
              <div class="card-title">{{ task.title }}</div>
              <div class="card-desc" v-if="task.description">{{ task.description }}</div>
              
              <div class="card-meta">
                <span class="responsible">
                  <i class="pi pi-user text-xs"></i>
                  {{ userName(task.responsibleId) }}
                </span>
                <span class="date" v-if="task.completedAt">
                  <i class="pi pi-check text-xs text-green-600"></i>
                  {{ formatDate(task.completedAt) }}
                </span>
              </div>
            </div>

            <div v-if="completedTasksList.length === 0" class="empty-column-placeholder">
              <i class="pi pi-check-circle"></i>
              <p>No hay tareas completadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-container {
  padding: 0 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.kanban-instructions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0fdf4;
  color: #166534;
  border-left: 4px solid #15803d;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.load-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.kanban-column {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-height: 550px;
  border: 2px dashed transparent;
  transition: background 0.2s, border-color 0.2s;
}

.kanban-column:hover {
  background: #e2e8f0;
}

/* Header customization per status */
.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #cbd5e1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.column-icon {
  font-size: 1.1rem;
}

.pending .column-icon { color: #d97706; }
.in-progress .column-icon { color: #2563eb; }
.completed .column-icon { color: #16a34a; }

.task-count {
  background: #cbd5e1;
  color: #475569;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.column-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

/* Task Cards */
.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Card Borders according to status */
.pending-border { border-left: 4px solid #f59e0b; }
.in-progress-border { border-left: 4px solid #3b82f6; }
.completed-border { border-left: 4px solid #10b981; }

.card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
  margin-bottom: 0.35rem;
}

.card-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: #64748b;
  margin-bottom: 0.75rem;
  border-top: 1px solid #f1f5f9;
  padding-top: 0.5rem;
}

.responsible, .date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-column-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #94a3b8;
  gap: 0.5rem;
  text-align: center;
}

.empty-column-placeholder i {
  font-size: 1.8rem;
}

.empty-column-placeholder p {
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 992px) {
  .kanban-board {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .kanban-column {
    min-height: auto;
  }
}
</style>
