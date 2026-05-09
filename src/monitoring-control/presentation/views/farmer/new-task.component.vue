<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TaskService } from '../../../application/task.service.js'
import { CheckListService } from '../../../application/checklist.service.js'
import { organizationService } from '../../../../organization/application/organization.service.js'
import { plotService } from '../../../../organization/application/plot.service.js'
import { UserProfileApi } from '../../../../profile/infrastructure/user-profile-api.js'
import Select from 'primevue/select'

const taskService = new TaskService()
const checkListService = new CheckListService()
const profileApi = new UserProfileApi()

// ─── estado ────────────────────────────────────────────────
const orgs       = computed(() => organizationService.state.organizations)
const selectedOrg    = ref(null)
const farmers    = ref([])
const parcels    = ref([])
const loadingOrg = ref(false)

const title          = ref('')
const description    = ref('')
const selectedFarmer = ref(null)
const selectedParcel = ref(null)

// muestra todos los farmers de la org (el backend ya no exige que sean miembros de la parcela)
const availableFarmers = computed(() => farmers.value)

const checklist = ref({ title: '', items: [] })

const submitting = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

// ─── cargar orgs al montar ─────────────────────────────────
onMounted(async () => {
  await organizationService.getAllOrganizations()
})

// ─── cuando cambia la org carga farmers y parcelas ─────────
watch(selectedOrg, async (org) => {
  selectedFarmer.value = null
  selectedParcel.value = null
  farmers.value = []
  parcels.value = []
  errorMsg.value = ''

  if (!org) return
  loadingOrg.value = true
  try {
    const [allFarmers, plots] = await Promise.all([
      profileApi.getAllUsers(),
      plotService.getPlotsByOrganizationId(org.id)
    ])

    const memberIds = new Set(org.members)
    farmers.value = (Array.isArray(allFarmers) ? allFarmers : [])
      .filter(u => memberIds.has(u.id) && u.role?.toLowerCase() === 'farmer')

    parcels.value = plots || []
  } catch (e) {
    errorMsg.value = 'Error al cargar datos de la organización.'
  } finally {
    loadingOrg.value = false
  }
})


// ─── checklist helpers ─────────────────────────────────────
const addItem    = () => checklist.value.items.push({ id: Date.now(), description: '' })
const removeItem = (i) => checklist.value.items.splice(i, 1)

// ─── submit ────────────────────────────────────────────────
async function submitForm() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!selectedOrg.value)    return (errorMsg.value = 'Selecciona una organización.')
  if (!title.value.trim())   return (errorMsg.value = 'El título es obligatorio.')
  if (!selectedFarmer.value) return (errorMsg.value = 'Selecciona un agricultor responsable.')
  if (!selectedParcel.value) return (errorMsg.value = 'Selecciona una parcela.')

  submitting.value = true
  try {
    const taskData = await taskService.registerNewTask({
      title: title.value,
      description: description.value,
      organizationId: selectedOrg.value.id,
      cropId: selectedParcel.value.id,
      responsibleId: selectedFarmer.value.id,
    })

    if (!taskData?.id) throw new Error('No se recibió ID de tarea.')

    const validItems = checklist.value.items
      .map(i => ({ description: i.description.trim() }))
      .filter(i => i.description)

    if (checklist.value.items.length > 0 && validItems.length === 0) {
      await taskService.deleteTask(taskData.id)
      errorMsg.value = 'El checklist debe tener al menos un ítem con texto válido.'
      return
    }

    if (validItems.length > 0) {
      await checkListService.registerNewChecklist({
        taskId: taskData.id,
        title: checklist.value.title?.trim() || 'Checklist',
        items: validItems,
      })
    }

    successMsg.value = '¡Tarea creada correctamente!'
    title.value = ''
    description.value = ''
    selectedOrg.value = null
    selectedFarmer.value = null
    selectedParcel.value = null
    checklist.value = { title: '', items: [] }
  } catch (err) {
    const msg = err.response?.data?.message
    errorMsg.value = msg || 'Error al registrar la tarea.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="card-form">
      <h2>Registrar nueva tarea</h2>

      <!-- Datos de la tarea -->
      <section class="section">
        <h3>Datos de la tarea</h3>

        <!-- Organización -->
        <div class="field">
          <label>Organización</label>
          <Select
            v-model="selectedOrg"
            :options="orgs"
            optionLabel="name"
            placeholder="Selecciona una organización"
            class="w-full"
          />
        </div>

        <!-- Título -->
        <div class="field">
          <label>Título</label>
          <pv-input-text v-model="title" placeholder="Ej. Revisión de riego" class="w-full" />
        </div>

        <!-- Descripción -->
        <div class="field">
          <label>Descripción <span class="optional">(opcional)</span></label>
          <pv-input-text v-model="description" placeholder="Descripción de la tarea" class="w-full" />
        </div>

        <!-- Cargando datos de org -->
        <div v-if="loadingOrg" class="loading-inline">
          <i class="pi pi-spin pi-spinner"></i> Cargando datos...
        </div>

        <template v-else-if="selectedOrg">
          <!-- Parcela (primero para filtrar farmers) -->
          <div class="field">
            <label>Parcela</label>
            <div v-if="parcels.length === 0" class="empty-hint">
              <i class="pi pi-info-circle"></i>
              No hay parcelas en esta organización. Crea una primero.
            </div>
            <Select
              v-else
              v-model="selectedParcel"
              :options="parcels"
              optionLabel="name"
              placeholder="Selecciona una parcela"
              class="w-full"
            />
          </div>

          <!-- Agricultor responsable -->
          <div class="field">
            <label>Agricultor responsable</label>
            <div v-if="farmers.length === 0" class="empty-hint">
              <i class="pi pi-info-circle"></i>
              No hay agricultores en esta organización. Invita uno primero.
            </div>
            <Select
              v-else
              v-model="selectedFarmer"
              :options="availableFarmers"
              optionLabel="displayName"
              placeholder="Selecciona un agricultor"
              class="w-full"
            />
          </div>
        </template>
      </section>

      <!-- Checklist -->
      <section class="section border-top">
        <h3>Checklist asociada <span class="optional">(opcional)</span></h3>
        <div class="field">
          <label>Título del checklist</label>
          <pv-input-text v-model="checklist.title" placeholder="Ej. Revisión de maquinaria" class="w-full" />
        </div>
        <label class="field-label">Ítems</label>
        <div v-for="(item, i) in checklist.items" :key="item.id" class="item-row">
          <pv-input-text v-model="item.description" placeholder="Descripción del ítem" class="flex-1" />
          <pv-button icon="pi pi-trash" severity="danger" text @click="removeItem(i)" />
        </div>
        <pv-button icon="pi pi-plus" label="Añadir ítem" outlined class="add-item-btn" @click="addItem" />
      </section>

      <!-- Mensajes -->
      <div v-if="errorMsg" class="msg error">
        <i class="pi pi-exclamation-circle"></i> {{ errorMsg }}
      </div>
      <div v-if="successMsg" class="msg success">
        <i class="pi pi-check-circle"></i> {{ successMsg }}
      </div>

      <!-- Botón -->
      <div class="submit-row">
        <pv-button
          label="Registrar tarea"
          icon="pi pi-check"
          class="submit-btn"
          :loading="submitting"
          @click="submitForm"
        />
      </div>
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

.loading-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
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
}

.submit-btn {
  background: #2c5530 !important;
  border-color: #2c5530 !important;
  min-width: 180px;
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
