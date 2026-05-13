<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { organizationService } from '../../../organization/application/organization.service.js';
import { invitationService } from '../../../organization/application/invitation.service.js';
import { userStore } from '../../../iam/application/user.store.js';
import AppLayout from '../components/app-layout.vue';
import ConfirmationModal from '../components/confirmation-modal.vue';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();

const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist');
const isFarmer = computed(() => userStore.state.user?.role === 'Farmer');
const pendingInvitations = computed(() => invitationService.state.invitations);
const organizations = computed(() => organizationService.state.organizations);
const loading = computed(() => organizationService.state.loading);
const error = computed(() => organizationService.state.error);

const filterValue = ref('');

onMounted(async () => {
  try {
    await organizationService.getAllOrganizations();
    if (isFarmer.value && userStore.state.user?.id) {
      await invitationService.fetchPending(userStore.state.user.id);
    }
  } catch (err) {
    console.error('Error loading organizations:', err);
  }
});

const showDeleteConfirm = ref(false);
const pendingDeleteOrg = ref(null);

const goCreate = () => router.push({ name: 'organization-create' });
const onEnter = (org) => router.push({ name: 'organization-detail', params: { id: org.id } });

const onDelete = (org) => {
  pendingDeleteOrg.value = org;
  showDeleteConfirm.value = true;
};

const handleDeleteConfirm = async () => {
  const org = pendingDeleteOrg.value;
  try {
    await organizationService.deleteOrganization(org.id);
    toast.add({ severity: 'success', summary: t('dashboard.deletedSummary'), detail: `"${org.name}" ${t('dashboard.deletedDetail')}`, life: 4000 });
  } catch {
    toast.add({ severity: 'error', summary: t('invitation.errorSummary'), detail: t('common.unexpectedError'), life: 4000 });
  } finally {
    pendingDeleteOrg.value = null;
  }
};

async function acceptInvitation(inv) {
  try {
    await invitationService.accept(inv.id, userStore.state.user.id);
    await organizationService.getAllOrganizations();
    toast.add({ severity: 'success', summary: t('invitation.acceptedSummary'), detail: t('invitation.acceptedDetail'), life: 4000 });
  } catch {
    toast.add({ severity: 'error', summary: t('invitation.errorSummary'), detail: t('invitation.errorAcceptDetail'), life: 4000 });
  }
}

async function rejectInvitation(inv) {
  try {
    await invitationService.reject(inv.id, userStore.state.user.id);
    toast.add({ severity: 'info', summary: t('invitation.rejectedSummary'), detail: t('invitation.rejectedDetail'), life: 4000 });
  } catch {
    toast.add({ severity: 'error', summary: t('invitation.errorSummary'), detail: t('invitation.errorRejectDetail'), life: 4000 });
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};
</script>

<template>
  <AppLayout>
    <div class="dashboard-content">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ t('dashboard.title') }}</h1>
          <p class="page-subtitle">{{ t('dashboard.subtitle') }}</p>
        </div>
        <Button
          v-if="isAgronomist"
          :label="t('dashboard.createNew')"
          icon="pi pi-plus"
          class="p-button-success"
          @click="goCreate"
          :disabled="loading"
        />
      </div>

      <!-- Invitaciones pendientes (solo Farmer) -->
      <div v-if="isFarmer && pendingInvitations.length > 0" class="invitations-section">
        <h2 class="section-title">
          <i class="pi pi-envelope"></i>
          {{ t('dashboard.pendingInvitations') }}
        </h2>
        <div class="invitations-list">
          <div v-for="inv in pendingInvitations" :key="inv.id" class="invitation-card">
            <div class="invitation-info">
              <i class="pi pi-envelope inv-icon"></i>
              <div>
                <p class="invitation-org">{{ inv.organizationName || t('dashboard.invitationFromOrg') }}</p>
                <p class="invitation-sub">{{ t('dashboard.invitationPending') }}</p>
              </div>
            </div>
            <div class="invitation-actions">
              <Button :label="t('common.accept')" icon="pi pi-check" class="p-button-success p-button-sm" @click="acceptInvitation(inv)" />
              <Button :label="t('common.reject')" icon="pi pi-times" class="p-button-danger p-button-sm p-button-outlined" @click="rejectInvitation(inv)" />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-box">
        <i class="pi pi-spin pi-spinner" style="font-size:2rem"></i>
        <p>{{ t('dashboard.loadingOrganizations') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-box">
        <i class="pi pi-exclamation-triangle" style="font-size:2rem;color:#e74c3c"></i>
        <p>{{ error }}</p>
        <Button :label="t('common.retry')" icon="pi pi-refresh" @click="organizationService.getAllOrganizations()" class="p-button-outlined" />
      </div>

      <!-- Empty -->
      <div v-else-if="organizations.length === 0" class="state-box">
        <i class="pi pi-building" style="font-size:3rem;color:#95a5a6"></i>
        <h3>{{ t('dashboard.noOrganizations') }}</h3>
        <p>{{ t('dashboard.noOrganizationsDesc') }}</p>
        <Button v-if="isAgronomist" :label="t('dashboard.createFirst')" icon="pi pi-plus" @click="goCreate" class="p-button-success" />
      </div>

      <!-- Buscador + Tabla de organizaciones -->
      <template v-else>
        <div class="search-bar">
          <span class="p-input-icon-left search-wrap">
            <i class="pi pi-search"></i>
            <InputText v-model="filterValue" :placeholder="t('common.search')" class="search-input" />
          </span>
        </div>

        <div class="table-section">
        <DataTable
          :value="organizations"
          :globalFilterFields="['name', 'description', 'location']"
          :filters="{ global: { value: filterValue, matchMode: 'contains' } }"
          responsiveLayout="scroll"
          class="org-table"
          :rowHover="true"
        >
          <Column field="name" :header="t('organization.name')" :sortable="true">
            <template #body="{ data }">
              <div class="name-cell">
                <i class="pi pi-building name-icon"></i>
                <span class="name-text">{{ data.name }}</span>
              </div>
            </template>
          </Column>

          <Column field="description" :header="t('organization.description')">
            <template #body="{ data }">
              <span class="desc-text">{{ data.description || '-' }}</span>
            </template>
          </Column>

          <Column field="location" :header="t('organization.location')">
            <template #body="{ data }">
              <div v-if="data.location" class="location-cell">
                <i class="pi pi-map-marker"></i>
                <span>{{ data.location }}</span>
              </div>
              <span v-else class="muted">-</span>
            </template>
          </Column>

          <Column :header="t('organization.members')">
            <template #body="{ data }">
              <span class="members-badge">
                <i class="pi pi-users"></i>
                {{ data.getMemberCount() }}
              </span>
            </template>
          </Column>

          <Column field="createdAt" :header="t('organization.createdAt')" :sortable="true">
            <template #body="{ data }">
              <span class="muted">{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>

          <Column :header="t('organization.actions')">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  :label="t('organizationExt.enter')"
                  icon="pi pi-arrow-right"
                  class="p-button-success p-button-sm"
                  @click="onEnter(data)"
                />
                <Button
                  v-if="isAgronomist"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text p-button-rounded"
                  @click="onDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
        </div>
      </template>
    </div>

    <ConfirmationModal
      v-model:visible="showDeleteConfirm"
      messageKey="organization.deleteConfirm"
      @confirm="handleDeleteConfirm"
    />
  </AppLayout>
</template>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1.25rem;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 0.2rem 0;
  color: #1a1a1a;
  font-size: 1.75rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Invitations */
.invitations-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #2c5530;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.invitation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #d4edda;
  border-left: 4px solid #2c5530;
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  gap: 1rem;
}

.invitation-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.inv-icon { font-size: 1.3rem; color: #2c5530; }

.invitation-org {
  margin: 0 0 0.1rem 0;
  font-weight: 600;
  color: #111;
  font-size: 0.95rem;
}

.invitation-sub {
  margin: 0;
  color: #6b7280;
  font-size: 0.82rem;
}

.invitation-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* States */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  gap: 0.5rem;
}

.state-box p { color: #666; font-size: 1rem; margin: 0.5rem 0; }
.state-box h3 { margin: 0.5rem 0; color: #2c5530; font-size: 1.3rem; }

/* Table */
.table-section {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  border: 1px solid #e9ecef;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrap .pi-search {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
  z-index: 1;
  pointer-events: none;
}

.search-input {
  padding-left: 2.2rem !important;
  width: 220px;
  font-size: 0.875rem;
}

:deep(.search-input.p-inputtext) {
  background: #fff !important;
  border-color: #d1d5db;
  border-radius: 8px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.name-icon { color: #2c5530; }

.name-text {
  font-weight: 600;
  color: #1a1a1a;
}

.desc-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #555;
  font-size: 0.875rem;
}

.location-cell i { color: #2c5530; font-size: 0.85rem; }

.members-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #e8f5e9;
  color: #2e7d32;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.muted { color: #9ca3af; font-size: 0.875rem; }

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.org-table {
  width: 100%;
}

:deep(.org-table .p-datatable-thead > tr > th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 700;
  font-size: 0.85rem;
  border-bottom: 2px solid #e9ecef;
}

:deep(.org-table .p-datatable-tbody > tr) {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

:deep(.org-table .p-datatable-tbody > tr:hover) {
  background: #f0faf2 !important;
}

:deep(.org-table .p-datatable-tbody > tr > td) {
  padding: 0.85rem 1rem;
  vertical-align: middle;
}
</style>
