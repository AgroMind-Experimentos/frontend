<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../shared/presentation/components/app-layout.vue'
import { ReportsService } from './application/reports.service.js'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const reportsService = new ReportsService()
const reportsData = ref(null)
const loading = ref(true)
const error = ref(null)
const downloadingPDF = ref(false)

onMounted(async () => {
  await loadReports()
})

const loadReports = async () => {
  loading.value = true
  error.value = null
  try {
    reportsData.value = await reportsService.getReports()
  } catch (err) {
    error.value = err.message || 'Error al cargar los reportes'
  } finally {
    loading.value = false
  }
}

const downloadPDF = async () => {
  downloadingPDF.value = true
  try {
    await reportsService.downloadPDF()
  } catch (err) {
    error.value = 'Error al descargar el PDF'
  } finally {
    downloadingPDF.value = false
  }
}

const getStatusSeverity = (status) => {
  const statusMap = {
    'Completed': 'success',
    'InProgress': 'info',
    'Pending': 'warning',
    'In Progress': 'info'
  }
  return statusMap[status] || 'secondary'
}

const getStatusLabel = (status) => {
  const labelMap = {
    'Completed': 'Completada',
    'InProgress': 'En Progreso',
    'Pending': 'Pendiente',
    'In Progress': 'En Progreso'
  }
  return labelMap[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

</script>

<template>
  <AppLayout>
    <div class="reports-container">
      <div class="header">
        <h1>📊 Panel de Reportes</h1>
        <p>Análisis completo de tareas y gestión de cultivos</p>
      </div>

      <!-- Acciones principales -->
      <div class="actions-bar">
        <Button
          label="Actualizar"
          icon="pi pi-refresh"
          @click="loadReports"
          :loading="loading"
          class="p-button-outlined"
        />
        <Button
          label="Descargar PDF"
          icon="pi pi-file-pdf"
          @click="downloadPDF"
          :loading="downloadingPDF"
          class="download-btn"
          severity="danger"
        />
      </div>

      <!-- Mensaje de carga -->
      <div v-if="loading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem; color: #4CAF50"></i>
        <p>Cargando reportes...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="error" class="error-container">
        <i class="pi pi-exclamation-triangle" style="font-size: 3rem; color: #dc3545"></i>
        <p>{{ error }}</p>
        <Button label="Reintentar" icon="pi pi-refresh" @click="loadReports" />
      </div>

      <!-- Contenido principal -->
      <div v-else-if="reportsData" class="reports-content">

        <!-- Información del reporte -->
        <div class="report-meta">
          <Card class="meta-card">
            <template #content>
              <div class="meta-info">
                <i class="pi pi-calendar"></i>
                <div>
                  <span class="meta-label">Generado el:</span>
                  <span class="meta-value">{{ formatDate(reportsData.generatedAt) }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tarjetas de resumen -->
        <div class="summary-grid">
          <Card class="summary-card total">
            <template #content>
              <div class="card-content">
                <div class="icon-wrapper total-icon">
                  <i class="pi pi-list"></i>
                </div>
                <div class="card-info">
                  <h3>{{ reportsData.summary.totalTasks }}</h3>
                  <p>Total de Tareas</p>
                </div>
              </div>
            </template>
          </Card>

          <Card class="summary-card completed">
            <template #content>
              <div class="card-content">
                <div class="icon-wrapper completed-icon">
                  <i class="pi pi-check-circle"></i>
                </div>
                <div class="card-info">
                  <h3>{{ reportsData.summary.completedTasks }}</h3>
                  <p>Completadas</p>
                </div>
              </div>
            </template>
          </Card>

          <Card class="summary-card in-progress">
            <template #content>
              <div class="card-content">
                <div class="icon-wrapper progress-icon">
                  <i class="pi pi-clock"></i>
                </div>
                <div class="card-info">
                  <h3>{{ reportsData.summary.inProgressTasks }}</h3>
                  <p>En Progreso</p>
                </div>
              </div>
            </template>
          </Card>

          <Card class="summary-card pending">
            <template #content>
              <div class="card-content">
                <div class="icon-wrapper pending-icon">
                  <i class="pi pi-exclamation-circle"></i>
                </div>
                <div class="card-info">
                  <h3>{{ reportsData.summary.pendingTasks }}</h3>
                  <p>Pendientes</p>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Tasa de completación -->
        <Card class="completion-card">
          <template #header>
            <div class="completion-header">
              <h3>
                <i class="pi pi-chart-line"></i>
                Tasa de Completación
              </h3>
            </div>
          </template>
          <template #content>
            <div class="completion-content">
              <div class="progress-info">
                <span class="progress-label">Progreso General</span>
                <span class="progress-value">{{ reportsData.summary.completionRate }}%</span>
              </div>
              <ProgressBar
                :value="reportsData.summary.completionRate"
                :show-value="false"
                class="custom-progress"
              />
              <div class="completion-stats">
                <div class="stat">
                  <i class="pi pi-check-circle" style="color: #28a745"></i>
                  <span>{{ reportsData.summary.completedTasks }} de {{ reportsData.summary.totalTasks }} tareas completadas</span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Tabla de tareas -->
        <Card class="tasks-table-card">
          <template #header>
            <div class="table-header">
              <h3>
                <i class="pi pi-table"></i>
                Detalle de Tareas
              </h3>
            </div>
          </template>
          <template #content>
            <DataTable
              :value="reportsData.tasks"
              :paginator="true"
              :rows="5"
              :rowsPerPageOptions="[5, 10, 20]"
              responsiveLayout="scroll"
              class="custom-table"
              stripedRows
            >
              <Column field="id" header="ID" :sortable="true" style="width: 80px">
                <template #body="slotProps">
                  <span class="task-id">#{{ slotProps.data.id }}</span>
                </template>
              </Column>

              <Column field="title" header="Título" :sortable="true">
                <template #body="slotProps">
                  <div class="task-title">
                    <i class="pi pi-bookmark"></i>
                    <span>{{ slotProps.data.title }}</span>
                  </div>
                </template>
              </Column>

              <Column field="responsibleId" header="Responsable" :sortable="true" style="width: 120px">
                <template #body="slotProps">
                  <div class="responsible">
                    <i class="pi pi-user"></i>
                    <span>Usuario {{ slotProps.data.responsibleId }}</span>
                  </div>
                </template>
              </Column>

              <Column field="status" header="Estado" :sortable="true" style="width: 150px">
                <template #body="slotProps">
                  <Tag
                    :value="getStatusLabel(slotProps.data.status)"
                    :severity="getStatusSeverity(slotProps.data.status)"
                  />
                </template>
              </Column>

              <Column field="startedAt" header="Inicio" :sortable="true" style="width: 120px">
                <template #body="slotProps">
                  <span class="date">{{ slotProps.data.startedAt || 'N/A' }}</span>
                </template>
              </Column>

              <Column field="completedAt" header="Completada" :sortable="true" style="width: 120px">
                <template #body="slotProps">
                  <span class="date">{{ slotProps.data.completedAt || 'N/A' }}</span>
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>

      </div>

    </div>
  </AppLayout>
</template>

<style scoped>
.reports-container {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f5e9 100%);
  min-height: calc(100vh - 80px);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #2c5530;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.header p {
  color: #666;
  font-size: 1.2rem;
}

/* Barra de acciones */
.actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.download-btn {
  background: linear-gradient(135deg, #dc3545, #e74c3c) !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: linear-gradient(135deg, #c82333, #dc3545) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3) !important;
}

/* Estados de carga y error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loading-container p,
.error-container p {
  font-size: 1.2rem;
  color: #666;
  font-weight: 500;
}

/* Contenido principal */
.reports-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Meta información */
.report-meta {
  margin-bottom: 1rem;
}

.meta-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fef9 100%) !important;
  border: 2px solid #e8f5e9 !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meta-info i {
  font-size: 1.5rem;
  color: #4CAF50;
}

.meta-label {
  font-weight: 600;
  color: #666;
  margin-right: 0.5rem;
}

.meta-value {
  color: #2c5530;
  font-weight: 500;
}

/* Grid de resumen */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.summary-card {
  border-radius: 16px !important;
  border: none !important;
  transition: all 0.3s ease;
  overflow: hidden;
}

.summary-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.summary-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.summary-card.completed {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
}

.summary-card.in-progress {
  background: linear-gradient(135deg, #17a2b8 0%, #00bcd4 100%) !important;
}

.summary-card.pending {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%) !important;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  color: white;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.icon-wrapper i {
  font-size: 2rem;
  color: white;
}

.card-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.card-info p {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Card de completación */
.completion-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%) !important;
  border: 2px solid #e3f2fd !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.completion-header,
.table-header {
  padding: 1.5rem;
  background: rgba(76, 175, 80, 0.05);
  border-bottom: 2px solid #e8f5e9;
}

.completion-header h3,
.table-header h3 {
  margin: 0;
  color: #2c5530;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.completion-header i,
.table-header i {
  color: #4CAF50;
  font-size: 1.5rem;
}

.completion-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-weight: 600;
  color: #666;
  font-size: 1.1rem;
}

.progress-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4CAF50;
}

.custom-progress {
  height: 30px;
  border-radius: 15px;
  background: #e9ecef !important;
}

.custom-progress :deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%) !important;
  border-radius: 15px;
}

.completion-stats {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 1rem;
}

.stat i {
  font-size: 1.2rem;
}

/* Tabla de tareas */
.tasks-table-card {
  background: white !important;
  border-radius: 16px !important;
  border: 2px solid #e8f5e9 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.custom-table {
  font-size: 0.95rem;
}

.custom-table :deep(.p-datatable-header) {
  background: transparent;
  border: none;
}

.custom-table :deep(.p-datatable-thead > tr > th) {
  background: #f8f9fa;
  color: #2c5530;
  font-weight: 600;
  border-bottom: 2px solid #4CAF50;
  padding: 1rem;
}

.custom-table :deep(.p-datatable-tbody > tr) {
  transition: all 0.2s ease;
}

.custom-table :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fef9 !important;
  transform: scale(1.01);
}

.custom-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.task-id {
  font-weight: 700;
  color: #667eea;
  background: #f0f4ff;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  display: inline-block;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
}

.task-title i {
  color: #4CAF50;
}

.responsible {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.responsible i {
  color: #17a2b8;
}

.date {
  color: #666;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .reports-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.8rem;
  }

  .header p {
    font-size: 1rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .actions-bar {
    flex-direction: column;
  }

  .actions-bar button {
    width: 100%;
  }

  .card-info h3 {
    font-size: 2rem;
  }

  .progress-value {
    font-size: 1.5rem;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reports-content {
  animation: fadeIn 0.5s ease-out;
}
</style>