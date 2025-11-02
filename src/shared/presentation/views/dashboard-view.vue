<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { organizationService } from '../../../organization/application/organization.service.js';
import AppLayout from '../components/app-layout.vue';
import OrganizationCard from '../../../organization/presentation/components/organization-card.vue';
import Button from 'primevue/button';

const { t } = useI18n();

const router = useRouter();

// State reactivo del servicio
const organizations = computed(() => organizationService.state.organizations);
const loading = computed(() => organizationService.state.loading);
const error = computed(() => organizationService.state.error);

// Cargar organizaciones al montar el componente
onMounted(async () => {
  try {
    await organizationService.getAllOrganizations();
  } catch (err) {
    console.error('Error loading organizations:', err);
  }
});

const goCreate = () => router.push({ name: 'organization-create' });

const onEnter = (org) => router.push({ name:'organization-detail', params:{ id: org.id }});

const onDelete = async (org) => {
  if (confirm(`${t('dashboard.deleteConfirm')} "${org.name}"?`)) {
    try {
      await organizationService.deleteOrganization(org.id);
    } catch (err) {
      alert(t('common.unexpectedError'));
    }
  }
};
</script>

<template>
  <AppLayout>
    <div class="dashboard-content">
      <div class="header">
        <h1>{{ t('dashboard.title') }}</h1>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>

      <div class="actions">
        <Button
          :label="t('dashboard.createNew')"
          icon="pi pi-plus"
          @click="goCreate"
          class="p-button-success"
          :disabled="loading"
        />
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('dashboard.loadingOrganizations') }}</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          :label="t('common.retry')"
          icon="pi pi-refresh"
          @click="organizationService.getAllOrganizations()"
          class="p-button-outlined"
        />
      </div>

      <!-- Estado sin organizaciones -->
      <div v-else-if="organizations.length === 0" class="empty-state">
        <i class="pi pi-building" style="font-size: 3rem; color: #95a5a6"></i>
        <h3>{{ t('dashboard.noOrganizations') }}</h3>
        <p>{{ t('dashboard.noOrganizationsDesc') }}</p>
        <Button
          :label="t('dashboard.createFirst')"
          icon="pi pi-plus"
          @click="goCreate"
          class="p-button-success"
        />
      </div>

      <!-- Lista de organizaciones -->
      <div v-else class="organizations-grid">
        <OrganizationCard
            v-for="org in organizations"
            :key="org.id"
            :org="org"
            @enter="onEnter(org)"
            @delete="onDelete(org)"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard-content {
  padding: 1rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 2rem;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.organizations-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
}

.loading-state p, .error-state p, .empty-state p {
  margin: 1rem 0;
  color: #666;
  font-size: 1.1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2c5530;
  font-size: 1.5rem;
}

.error-state .p-button {
  margin-top: 1rem;
}
</style>