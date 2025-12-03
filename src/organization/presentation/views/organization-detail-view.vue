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

const organization = computed(() => organizationService.state.currentOrganization);
const plots = computed(() => plotService.state.plots);
const loading = computed(() => plotService.state.loading || organizationService.state.loading);
const error = computed(() => plotService.state.error || organizationService.state.error);

onMounted(async () => {
  try {
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

const parseDescription = (description) => {
  if (!description) return {};

  const data = {};
  const parts = description.split('|').map(p => p.trim());

  parts.forEach(part => {
    if (part.includes('Área:')) {
      data.area = part.replace('Área:', '').trim();
    } else if (part.includes('Ubicación:')) {
      data.location = part.replace('Ubicación:', '').trim();
    } else if (part.includes('Cultivo:')) {
      data.crop = part.replace('Cultivo:', '').trim();
    } else if (part.includes('Miembros:')) {
      data.membersCount = part.replace('Miembros:', '').trim();
    }
  });

  return data;
};

const getPlotField = (plot, field) => {
  if (plot[field]) return plot[field];
  const parsedData = parseDescription(plot.description);
  return parsedData[field] || '-';
};

const getMemberCount = (plot) => {
  if (plot.members && Array.isArray(plot.members)) {
    return plot.members.length;
  }
  if (plot.getMemberCount) {
    return plot.getMemberCount();
  }
  const parsedData = parseDescription(plot.description);
  return parsedData.membersCount || '0';
};
</script>

<template>
  <AppLayout>
    <div class="organization-detail">
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

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('organization.loadingParcels') }}</p>
      </div>

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

      <div v-else-if="plots.length > 0" class="plots-section">
        <h2>{{ t('organization.parcelsTitle') }}</h2>

        <DataTable :value="plots" responsiveLayout="scroll" class="plots-table">
          <Column field="name" :header="t('organization.name')" :sortable="true">
            <template #body="slotProps">
              <div class="plot-name">
                <i class="pi pi-map text-green-600"></i>
                <span>{{ slotProps.data.name }}</span>
              </div>
            </template>
          </Column>

          <Column field="area" :header="t('organization.area')" :sortable="true">
            <template #body="slotProps">
              <span class="area-badge">{{ getPlotField(slotProps.data, 'area') }}</span>
            </template>
          </Column>

          <Column field="crop" :header="t('organization.crop')" :sortable="true">
            <template #body="slotProps">
              <div class="crop-info">
                <i class="pi pi-leaf text-green-500"></i>
                <span>{{ getPlotField(slotProps.data, 'crop') }}</span>
              </div>
            </template>
          </Column>

          <Column field="location" :header="t('organization.location')">
            <template #body="slotProps">
              <span class="location-text">{{ getPlotField(slotProps.data, 'location') }}</span>
            </template>
          </Column>

          <Column field="members" :header="t('organization.members')">
            <template #body="slotProps">
              <span class="members-count">{{ getMemberCount(slotProps.data) }}</span>
            </template>
          </Column>

          <Column :header="t('organization.actions')">
            <template #body="slotProps">
              <div class="action-buttons">

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
  gap: 2rem;
  flex-wrap: wrap;
}

.organization-info {
  flex: 1;
  min-width: 300px;
}

.organization-info h1 {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 2rem;
}

.description {
  color: #666;
  margin: 0 0 1rem 0;
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
  color: #2c5530;
}

.actions {
  display: flex;
  align-items: center;
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

.empty-state h2 {
  margin: 0.5rem 0;
  color: #2c5530;
  font-size: 1.5rem;
}

.plots-section {
  margin-top: 2rem;
}

.plots-section h2 {
  margin-bottom: 1rem;
  color: #2c5530;
  font-size: 1.5rem;
}

.plots-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.plot-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.crop-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.area-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.location-text {
  color: #555;
}

.members-count {
  color: #555;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.text-green-600 {
  color: #16a34a;
}

.text-green-500 {
  color: #22c55e;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .meta-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>

