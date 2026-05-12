<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { organizationService } from '../../application/organization.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const orgId = route.params.id;

const loading = computed(() => organizationService.state.loading);

const name = ref('');
const description = ref('');

onMounted(async () => {
  try {
    const org = await organizationService.getOrganizationById(orgId);
    name.value = org.name;
    description.value = org.description;
  } catch {
    toast.add({ severity: 'error', summary: t('common.unexpectedError'), life: 3000 });
  }
});

async function saveChanges() {
  if (!name.value.trim()) {
    toast.add({ severity: 'warn', summary: t('organization.nameRequired'), life: 3000 });
    return;
  }

  const currentOrg = organizationService.state.currentOrganization;
  const memberIds = Array.isArray(currentOrg?.members)
    ? currentOrg.members.map(id => Number(id))
    : [];

  try {
    await organizationService.patchOrganization(orgId, {
      name: name.value.trim(),
      description: description.value.trim(),
      memberIds
    });
    toast.add({ severity: 'success', summary: t('organization.updateSuccess'), life: 3000 });
    router.push({ name: 'organization-detail', params: { id: orgId } });
  } catch {
    toast.add({ severity: 'error', summary: t('organization.updateError'), life: 3000 });
  }
}

function goBack() {
  router.push({ name: 'organization-detail', params: { id: orgId } });
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <h2 class="page-title">{{ t('organization.editTitle') }}</h2>

      <Card class="panel">
        <template #title>
          <div class="panel-title">
            <i class="pi pi-building mr-2 text-orange-500"></i>
            <span>{{ t('organization.data') }}</span>
          </div>
        </template>
        <template #content>
          <div class="p-fluid">
            <label class="label">{{ t('organization.name') }}</label>
            <InputText v-model="name" :placeholder="t('organization.name')" class="mb-3" />

            <label class="label">{{ t('organization.description') }}</label>
            <InputText v-model="description" :placeholder="t('organization.description')" class="mb-3" />

          </div>
        </template>
      </Card>

      <div class="actions">
        <Button
          :label="t('common.cancel')"
          class="p-button-outlined btn-cancel"
          @click="goBack"
        />
        <Button
          :label="t('common.save')"
          class="btn-primary"
          @click="saveChanges"
          :loading="loading"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap { max-width: 600px; margin: 0 auto; }
.page-title { margin: 12px 0 22px 0; text-align: center; color: #111; }
.panel-title { display: flex; align-items: center; font-weight: 700; color: #111; gap: 8px; }
.label { display: block; font-weight: 600; margin-bottom: 6px; color: #111; }
:deep(.p-inputtext) { background: #fff !important; color: #111 !important; border-color: #d1d5db; }
:deep(.p-inputtext::placeholder) { color: #9ca3af; }
.actions { display: flex; justify-content: center; gap: 1rem; margin-top: 28px; }
.btn-primary { min-width: 140px; }
.btn-cancel { min-width: 120px; }
</style>
