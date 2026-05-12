<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { organizationService } from '../../../organization/application/organization.service.js';
import { invitationService } from '../../../organization/application/invitation.service.js';
import { userStore } from '../../../iam/application/user.store.js';
import AppLayout from '../components/app-layout.vue';
import OrganizationCard from '../../../organization/presentation/components/organization-card.vue';
import ConfirmationModal from '../components/confirmation-modal.vue';
import Button from 'primevue/button';

const { t } = useI18n();
const toast = useToast();
const router = useRouter();

const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist');
const isFarmer = computed(() => userStore.state.user?.role === 'Farmer');
const pendingInvitations = computed(() => invitationService.state.invitations);

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

// State reactivo del servicio
const organizations = computed(() => organizationService.state.organizations);
const loading = computed(() => organizationService.state.loading);
const error = computed(() => organizationService.state.error);

// Cargar organizaciones al montar el componente
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

const onEnter = (org) => router.push({ name:'organization-detail', params:{ id: org.id }});

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
</script>

<template>
  <AppLayout>
    <div class="dashboard-content">
      <div class="header">
        <h1>{{ t('dashboard.title') }}</h1>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>

      <!-- Invitaciones pendientes (solo Farmer) -->
      <div v-if="isFarmer && pendingInvitations.length > 0" class="invitations-section">
        <h2 class="invitations-title">{{ t('dashboard.pendingInvitations') }}</h2>
        <div class="invitations-list">
          <div v-for="inv in pendingInvitations" :key="inv.id" class="invitation-card">
            <div class="invitation-info">
              <i class="pi pi-envelope" style="font-size:1.4rem;color:#2c5530"></i>
              <div>
                <p class="invitation-org">{{ inv.organizationName || t('dashboard.invitationFromOrg') }}</p>
                <p class="invitation-sub">{{ t('dashboard.invitationPending') }}</p>
              </div>
            </div>
            <div class="invitation-actions">
              <Button
                :label="t('common.accept')"
                icon="pi pi-check"
                class="p-button-success p-button-sm"
                @click="acceptInvitation(inv)"
              />
              <Button
                :label="t('common.reject')"
                icon="pi pi-times"
                class="p-button-danger p-button-sm p-button-outlined"
                @click="rejectInvitation(inv)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="actions" v-if="isAgronomist">
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
          v-if="isAgronomist"
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
            :can-delete="isAgronomist"
            @enter="onEnter(org)"
            @delete="onDelete(org)"
        />
      </div>
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

.invitations-section {
  margin-bottom: 2rem;
}

.invitations-title {
  font-size: 1.3rem;
  color: #2c5530;
  margin: 0 0 1rem 0;
}

.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invitation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #d4edda;
  border-left: 4px solid #2c5530;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.invitation-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.invitation-org {
  margin: 0 0 0.2rem 0;
  font-weight: 600;
  color: #111;
  font-size: 1rem;
}

.invitation-sub {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.invitation-actions {
  display: flex;
  gap: 0.5rem;
}
</style>