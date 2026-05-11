<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { invitationService } from '../../../organization/application/invitation.service.js';
import { userStore } from '../../../iam/application/user.store.js';

const { t } = useI18n();
const toast = useToast();
const open  = ref(false);
const error = ref('');

const invitations = computed(() => Array.isArray(invitationService.state.invitations) ? invitationService.state.invitations : []);
const loading     = computed(() => invitationService.state.loading);
const count       = computed(() => invitations.value.length);

async function load() {
  const userId = userStore.state.user?.id;
  if (!userId) return;
  error.value = '';
  try {
    await invitationService.fetchPending(userId);
  } catch {
    error.value = t('invitation.loadError') || t('common.unexpectedError');
  }
}

async function accept(invitationId) {
  error.value = '';
  try {
    await invitationService.accept(invitationId, userStore.state.user?.id);
    toast.add({ severity: 'success', summary: t('invitation.acceptedSummary'), detail: t('invitation.acceptedDetail'), life: 4000 });
  } catch {
    error.value = t('invitation.errorAcceptDetail');
    toast.add({ severity: 'error', summary: t('invitation.errorSummary'), detail: t('invitation.errorAcceptDetail'), life: 4000 });
  }
}

async function reject(invitationId) {
  error.value = '';
  try {
    await invitationService.reject(invitationId, userStore.state.user?.id);
    toast.add({ severity: 'info', summary: t('invitation.rejectedSummary'), detail: t('invitation.rejectedDetail'), life: 4000 });
  } catch {
    error.value = t('invitation.errorRejectDetail');
    toast.add({ severity: 'error', summary: t('invitation.errorSummary'), detail: t('invitation.errorRejectDetail'), life: 4000 });
  }
}

function toggle() { open.value = !open.value; }

function onOutsideClick(e) {
  if (!e.target.closest('.inv-bell')) open.value = false;
}

onMounted(() => {
  load();
  document.addEventListener('click', onOutsideClick);
});
onUnmounted(() => document.removeEventListener('click', onOutsideClick));
</script>

<template>
  <div class="inv-bell">
    <button class="bell-btn" @click.stop="toggle" :title="t('invitation.bellTitle')">
      <i class="pi pi-envelope"></i>
      <span v-if="count > 0" class="badge">{{ count }}</span>
    </button>

    <div v-if="open" class="dropdown">
      <div class="dropdown-header">
        <span>{{ t('invitation.bellHeader') }}</span>
        <button class="close-btn" @click="open = false"><i class="pi pi-times"></i></button>
      </div>

      <div v-if="loading" class="empty-state">
        <i class="pi pi-spin pi-spinner"></i> {{ t('invitation.loading') }}
      </div>

      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle"></i> {{ error }}
      </div>

      <div v-else-if="count === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <span>{{ t('invitation.empty') }}</span>
      </div>

      <ul v-else class="inv-list">
        <li v-for="inv in invitations" :key="inv.id" class="inv-item">
          <div class="inv-org">
            <i class="pi pi-building"></i>
            <span>{{ inv.organizationName || inv.organization?.name || t('invitation.orgFallback') }}</span>
          </div>
          <div class="inv-actions">
            <button class="btn-accept" @click="accept(inv.id)">{{ t('common.accept') }}</button>
            <button class="btn-reject" @click="reject(inv.id)">{{ t('common.reject') }}</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.inv-bell { position: relative; }

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  color: #2c5530;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.bell-btn:hover { background: #f0fdf4; }

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,.14);
  border: 1px solid #e5e7eb;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-weight: 700;
  color: #2c5530;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.95rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 0.85rem;
  padding: 2px 4px;
  border-radius: 4px;
}
.close-btn:hover { color: #374151; background: #f3f4f6; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  color: #9ca3af;
  font-size: 0.875rem;
}
.empty-state i { font-size: 1.5rem; }

.error-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: #991b1b;
  background: #fee2e2;
  font-size: 0.875rem;
}

.inv-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
}

.inv-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.inv-item:last-child { border-bottom: none; }

.inv-org {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-weight: 600;
  font-size: 0.9rem;
}
.inv-org i { color: #2c5530; }

.inv-actions {
  display: flex;
  gap: 8px;
}

.btn-accept, .btn-reject {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 6px 0;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-accept { background: #d1fae5; color: #065f46; }
.btn-accept:hover { background: #a7f3d0; }
.btn-reject { background: #fee2e2; color: #991b1b; }
.btn-reject:hover { background: #fecaca; }
</style>
