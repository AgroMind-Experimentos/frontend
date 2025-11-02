<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { organizationService } from '../../application/organization.service.js';
import { plotService } from '../../application/plot.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const orgId = route.params.id;

// Estados reactivos
const organization = computed(() => organizationService.state.currentOrganization);
const plots = computed(() => plotService.state.plots);
const loading = computed(() => plotService.state.loading || organizationService.state.loading);
const error = computed(() => plotService.state.error || organizationService.state.error);

onMounted(async () => {
  try {
    // Cargar organización y sus parcelas
    await organizationService.getOrganizationById(orgId);
    await plotService.getPlotsByOrganizationId(orgId);
  } catch (err) {
    console.error('Error loading organization details:', err);
  }
});

const goCreateParcel = () => {
  router.push({ name: 'parcel-create', query: { orgId } });
};

const editPlot = (plot) => {
  router.push({ name: 'parcel-edit', params: { id: plot.id } });
};

const deletePlot = async (plot) => {
  if (confirm(`${t('organization.deleteParcelConfirm')} "${plot.name}"?`)) {
    try {
      await plotService.deletePlot(plot.id);
    } catch (err) {
      alert(t('common.unexpectedError'));
      console.error('Error deleting plot:', err);
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<template>
  <AppLayout>
    <div class="organization-detail">
      <!-- Header de la organización -->
      <div class="header" v-if="organization">
        <div class="organization-info">
          <h1>{{ organization.name }}</h1>
          <p class="description">{{ organization.description }}</p>
          <div class="meta-info">
            <div class="meta-item">
              <i class="pi pi-map-marker"></i>
              <span>{{ organization.location }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-users"></i>
              <span>{{ organization.getMemberCount() }} {{ t('organization.memberCount') }}</span>
            </div>
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span>{{ t('organization.createdAt') }}: {{ formatDate(organization.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <Button
            :label="t('organization.createParcel')"
            icon="pi pi-plus"
            @click="goCreateParcel"
            class="p-button-success"
            :disabled="loading"
          />
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('organization.loadingParcels') }}</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          :label="t('common.retry')"
          icon="pi pi-refresh"
          @click="plotService.getPlotsByOrganizationId(orgId)"
          class="p-button-outlined"
        />
      </div>

      <!-- Lista de parcelas -->
      <div v-else-if="plots.length > 0" class="plots-section">
        <h2>{{ t('organization.parcelsTitle') }}</h2>

        <DataTable :value="plots" responsiveLayout="scroll" class="plots-table">
          <Column field="name" :header="t('organization.name')" sortable>
            <template #body="slotProps">
              <div class="plot-name">
                <i class="pi pi-map text-green-600"></i>
                <span>{{ slotProps.data.name }}</span>
              </div>
            </template>
          </Column>

          <Column field="area" :header="t('organization.area')" sortable>
            <template #body="slotProps">
              <span class="area-badge">{{ slotProps.data.area }}</span>
            </template>
          </Column>

          <Column field="crop" :header="t('organization.crop')" sortable>
            <template #body="slotProps">
              <div class="crop-info">
                <i class="pi pi-leaf text-green-500"></i>
                <span>{{ slotProps.data.crop }}</span>
              </div>
            </template>
          </Column>

          <Column field="location" :header="t('organization.location')">
            <template #body="slotProps">
              <span class="location-text">{{ slotProps.data.location }}</span>
            </template>
          </Column>

          <Column field="members" :header="t('organization.members')">
            <template #body="slotProps">
              <span class="members-count">{{ slotProps.data.getMemberCount() }}</span>
            </template>
          </Column>

          <Column :header="t('organization.actions')">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-warning"
                  @click="editPlot(slotProps.data)"
                  :title="t('organization.editParcel')"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-danger"
                  @click="deletePlot(slotProps.data)"
                  :title="t('organization.deleteParcel')"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Estado sin parcelas -->
      <div v-else class="empty-state">
        <i class="pi pi-map box-icon"></i>
        <h2 class="title">{{ t('organization.noParcels') }}</h2>
        <p>{{ t('organization.noParcelsDesc') }}</p>
        <Button
          :label="t('organization.createFirstParcel')"
          icon="pi pi-plus"
          @click="goCreateParcel"
          class="p-button-success"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.organization-detail {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.organization-info h1 {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 2rem;
}

.description {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1.1rem;
  line-height: 1.5;
}

.meta-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #555;
}

.meta-item i {
  color: #4CAF50;
}

.plots-section h2 {
  color: #2c5530;
  margin-bottom: 1rem;
}

.plots-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plot-name, .crop-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.area-badge {
  background: #E8F5E8;
  color: #2E7D32;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.875rem;
}

.location-text {
  color: #666;
  font-size: 0.9rem;
}

.members-count {
  background: #F3E5F5;
  color: #7B1FA2;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin-top: 2rem;
}

.loading-state p, .error-state p, .empty-state p {
  margin: 1rem 0;
  color: #666;
  font-size: 1.1rem;
}

.box-icon {
  font-size: 4rem;
  color: #95a5a6;
  margin-bottom: 1rem;
}

.empty-state .title {
  margin: 0.5rem 0;
  color: #2c5530;
  font-size: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .organization-detail {
    padding: 0.5rem;
  }
}
</style>
