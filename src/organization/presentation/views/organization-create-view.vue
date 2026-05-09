<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { organizationService } from '../../application/organization.service.js';
import { userStore } from '../../../iam/application/user.store.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n();
const router = useRouter();

const name = ref('');
const description = ref('');
const locationTxt = ref('');

const loading = computed(() => organizationService.state.loading);

async function createOrg() {
  if (!name.value.trim()) {
    alert(t('organization.nameRequired'));
    return;
  }

  try {
    const agronomistId = userStore.state.user?.id;

    await organizationService.createOrganization({
      name: name.value.trim(),
      description: description.value.trim(),
      location: locationTxt.value.trim(),
      status: 'active',
      agronomistId
    });

    router.push({ name: 'dashboard' });
  } catch (err) {
    alert(`Error: ${err.message || t('common.unexpectedError')}`);
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <h2 class="page-title">{{ t('organization.create') }}</h2>

      <Card class="panel">
        <template #title>
          <div class="panel-title">
            <i class="pi pi-building mr-2 text-orange-500"></i>
            <span>{{ t('organization.data') }}:</span>
          </div>
        </template>
        <template #content>
          <div class="p-fluid">
            <label class="label">{{ t('organization.name') }}</label>
            <InputText v-model="name" :placeholder="t('organization.name')" class="mb-3" />

            <label class="label">{{ t('organization.description') }}</label>
            <InputText v-model="description" :placeholder="t('organization.description')" class="mb-3" />

            <label class="label">{{ t('organization.location') }}</label>
            <InputText v-model="locationTxt" :placeholder="t('organization.location')" />
          </div>
        </template>
      </Card>

      <div class="actions">
        <Button :label="t('common.create')" class="btn-primary" @click="createOrg" :loading="loading" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap{max-width:600px;margin:0 auto}
.page-title{margin:12px 0 22px 0;text-align:center;color:#111}
.panel-title{display:flex;align-items:center;font-weight:700;color:#111;gap:8px}
.label{display:block;font-weight:600;margin-bottom:6px;color:#111}
:deep(.p-inputtext){background:#fff !important;color:#111 !important;border-color:#d1d5db}
:deep(.p-inputtext::placeholder){color:#9ca3af}
.actions{display:flex;justify-content:center;margin-top:28px}
.btn-primary{min-width:160px}
</style>
