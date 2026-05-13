<script setup lang="js">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Select from 'primevue/select'
import { TaskService } from '../../application/task.service.js'
import { CheckListService } from '../../application/checklist.service.js'
import { organizationService } from '../../../organization/application/organization.service.js'
import { UserProfileApi } from '../../../profile/infrastructure/user-profile-api.js'

const route = useRoute()
const router = useRouter()
const taskId = Number(route.params.id)

const taskService = new TaskService()
const checkListService = new CheckListService()
const profileApi = new UserProfileApi()

const title = ref('')
const description = ref('')
const selectedFarmer = ref(null)
const farmers = ref([])
const checklistId = ref(null)
const items = ref([])
const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  try {
    const task = await taskService.getTaskById(taskId)
    if (!task) { errorMsg.value = 'Tarea no encontrada.'; loading.value = false; return }

    title.value = task.title
    description.value = task.description || ''

    // Load farmers of the task's organization
    if (organizationService.state.organizations.length === 0)
      await organizationService.getAllOrganizations()

    const org = organizationService.state.organizations.find(o => o.id === task.organizationId)
    if (org) {
      const allUsers = await profileApi.getAllUsers()
      const memberIds = new Set(org.members)
      farmers.value = (Array.isArray(allUsers) ? allUsers : [])
        .filter(u => memberIds.has(u.id) && u.role?.toLowerCase() === 'farmer')
      selectedFarmer.value = farmers.value.find(f => f.id === task.responsibleId) || null
    }

    const checklist = await checkListService.getChecklistByTaskId(taskId)
    if (checklist?.items?.length > 0) {
      checklistId.value = checklist.id
      items.value = checklist.items.map(i => ({ uid: crypto.randomUUID(), description: i.description }))
    }
  } catch {
    errorMsg.value = 'Error al cargar la tarea.'
  } finally {
    loading.value = false
  }
})

const addItem = () => items.value.push({ uid: crypto.randomUUID(), description: '' })
const removeItem = (i) => items.value.splice(i, 1)

async function save() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!title.value.trim()) {
    errorMsg.value = 'El título es obligatorio.'
    return
  }
  if (!selectedFarmer.value) {
    errorMsg.value = 'Selecciona un agricultor responsable.'
    return
  }

  const hasEmptyItem = items.value.some(i => !i.description.trim())
  if (hasEmptyItem) {
    errorMsg.value = 'Todos los ítems del checklist deben tener texto.'
    return
  }

  const validItems = items.value
    .map(i => ({ description: i.description.trim() }))
    .filter(i => i.description)

  saving.value = true
  try {
    await taskService.updateTask(taskId, {
      title: title.value,
      description: description.value,
      responsibleId: selectedFarmer.value.id
    })

    if (validItems.length > 0) {
      if (checklistId.value) {
        await checkListService.updateChecklist(checklistId.value, validItems)
      } else {
        await checkListService.registerNewChecklist({ taskId, title: 'Checklist', items: validItems })
      }
    }

    successMsg.value = '¡Tarea actualizada correctamente!'
    setTimeout(() => router.push('/tasks/pending'), 1200)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al guardar los cambios.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="card-form">
      <h2>{{ $t('taskForm.editTask') }}</h2>

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spinner pi-spin"></i>
        <span>{{ $t('common.loading') }}</span>
      </div>

      <template v-else>
        <section class="section">
          <h3>{{ $t('taskForm.taskData') }}</h3>

          <div class="field">
            <label>{{ $t('taskForm.title') }}</label>
            <pv-input-text v-model="title" :placeholder="$t('taskForm.taskTitlePlaceholder')" class="w-full" />
          </div>

          <div class="field">
            <label>{{ $t('tasks.description') }} <span class="optional">{{ $t('taskForm.optional') }}</span></label>
            <pv-input-text v-model="description" :placeholder="$t('taskForm.taskDescPlaceholder')" class="w-full" />
          </div>

          <div class="field">
            <label>{{ $t('taskForm.responsibleFarmer') }}</label>
            <div v-if="farmers.length === 0" class="empty-hint">
              <i class="pi pi-info-circle"></i>
              {{ $t('taskForm.noFarmersAvailable') }}
            </div>
            <Select
              v-else
              v-model="selectedFarmer"
              :options="farmers"
              optionLabel="displayName"
              :placeholder="$t('taskForm.selectFarmer')"
              class="w-full"
            />
          </div>
        </section>

        <section class="section border-top">
          <h3>{{ $t('tasksExt.checklist') }} <span class="optional">{{ $t('taskForm.optional') }}</span></h3>
          <label class="field-label">{{ $t('taskForm.items') }}</label>
          <div v-for="(item, i) in items" :key="item.uid" class="item-row">
            <pv-input-text v-model="item.description" :placeholder="$t('taskForm.itemDescPlaceholder')" class="flex-1" />
            <pv-button icon="pi pi-trash" severity="danger" text @click="removeItem(i)" />
          </div>
          <pv-button icon="pi pi-plus" :label="$t('taskForm.addItem')" outlined class="add-item-btn" @click="addItem" />
        </section>

        <div v-if="errorMsg" class="msg error">
          <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="msg success">
          <i class="pi pi-check-circle"></i> {{ successMsg }}
        </div>

        <div class="submit-row">
          <pv-button
            :label="$t('common.cancel')"
            icon="pi pi-times"
            class="cancel-btn"
            severity="secondary"
            outlined
            @click="router.push('/tasks/pending')"
          />
          <pv-button
            :label="$t('taskForm.saveChanges')"
            icon="pi pi-check"
            class="submit-btn"
            :loading="saving"
            @click="save"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  padding: 1rem 2rem 2rem;
}

.card-form {
  width: 100%;
  max-width: 680px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
}

h2 {
  color: #2c5530;
  text-align: center;
  margin: 0 0 1.5rem;
  font-size: 1.4rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.border-top {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.25rem;
}

h3 {
  color: #2c5530;
  border-left: 4px solid #2c5530;
  padding-left: 0.5rem;
  margin: 0;
  font-size: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label, .field-label {
  font-weight: 500;
  color: #444;
  font-size: 0.9rem;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.82rem;
}

.empty-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  font-size: 0.88rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-item-btn {
  align-self: flex-start;
  color: #6b7280;
  border-color: #d1d5db;
}

.msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.msg.error   { background: #fee2e2; color: #991b1b; }
.msg.success { background: #d1fae5; color: #065f46; }

.submit-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.submit-btn {
  background: #2c5530 !important;
  border-color: #2c5530 !important;
  min-width: 160px;
}

.cancel-btn {
  min-width: 120px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #666;
}

:deep(.p-inputtext) {
  background: #fff !important;
  color: #111 !important;
  border-color: #d1d5db;
  border-radius: 0.5rem;
}

:deep(.p-select) {
  background: #fff !important;
  border-color: #d1d5db;
  border-radius: 0.5rem;
  width: 100%;
}

.w-full { width: 100%; }
.flex-1 { flex: 1; }
</style>
