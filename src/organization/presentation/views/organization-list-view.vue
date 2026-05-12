<template>
  <AppLayout>
    <div class="organizations-list">
      <div class="header">
        <h1>{{ t('organization.list') }}</h1>
        <Button
          :label="t('organization.create')"
          icon="pi pi-plus"
          @click="goToCreate"
          class="p-button-success"
        />
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('organization.loading') }}</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          :label="t('common.retry')"
          icon="pi pi-refresh"
          @click="loadOrganizations"
          class="p-button-outlined"
        />
      </div>

      <!-- Lista de organizaciones -->
      <div v-else-if="organizations.length > 0" class="organizations-grid">
        <organization-card
          v-for="org in organizations"
          :key="org.id"
          :org="org"
          @enter="goToDetail"
          @delete="deleteOrganization"
        />
      </div>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <i class="pi pi-building box-icon"></i>
        <h2>{{ t('organization.noOrganizations') }}</h2>
        <p>{{ t('organization.noOrganizationsDesc') }}</p>
        <Button
          :label="t('organization.createFirst')"
          icon="pi pi-plus"
          @click="goToCreate"
          class="p-button-success"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { organizationService } from '../../application/organization.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';
import OrganizationCard from '../components/organization-card.vue';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();

const organizations = computed(() => organizationService.state.organizations);
const loading = computed(() => organizationService.state.loading);
const error = computed(() => organizationService.state.error);

onMounted(async () => {
  await loadOrganizations();
});

async function loadOrganizations() {
  try {
    console.log('📥 Cargando organizaciones desde el backend...');
    await organizationService.getAllOrganizations();
    console.log('✅ Organizaciones cargadas:', organizations.value);
  } catch (err) {
    console.error('❌ Error al cargar organizaciones:', err);
  }
}

function goToCreate() {
  router.push({ name: 'organization-create' });
}

function goToDetail(org) {
  router.push({ name: 'organization-detail', params: { id: org.id } });
}

async function deleteOrganization(org) {
  if (confirm(`¿Estás seguro de eliminar "${org.name}"?`)) {
    try {
      await organizationService.deleteOrganization(org.id);
      alert('Organización eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting organization:', err);
      alert('Error al eliminar la organización');
    }
  }
}
</script>

<style scoped>
.organizations-list {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  color: #2c5530;
  font-size: 2rem;
}

.organizations-grid {
  display: grid;
  gap: 1.5rem;
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>

