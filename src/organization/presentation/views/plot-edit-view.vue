<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { plotService } from '../../application/plot.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const plotId = route.params.id;

// Estados del servicio
const loading = computed(() => plotService.state.loading);
const error = computed(() => plotService.state.error);
const currentPlot = computed(() => plotService.state.currentPlot);

// ---- Formulario ----
const name = ref('');
const area = ref('');
const locationTxt = ref('');
const crop = ref('');
const orgId = ref(null);

onMounted(async () => {
  try {
    await plotService.getPlotById(plotId);
    // Llenar el formulario con los datos actuales
    if (currentPlot.value) {
      name.value = currentPlot.value.name;
      area.value = String(currentPlot.value.area);
      locationTxt.value = currentPlot.value.location;
      crop.value = currentPlot.value.crop;
      orgId.value = currentPlot.value.organizationId;
    }
  } catch (err) {
    console.error('Error loading plot data:', err);
  }
});

async function updatePlot() {
  if (!name.value.trim()) {
    toast.add({ severity: 'warn', summary: t('organization.plotNameRequired'), life: 3000 });
    return;
  }

  if (!orgId.value) {
    console.error('❌ Missing organizationId for plot');
    return;
  }

  try {
    const description = [
      area.value.trim() ? `Área: ${area.value.trim()}` : '',
      locationTxt.value.trim() ? `Ubicación: ${locationTxt.value.trim()}` : '',
      crop.value.trim() ? `Cultivo: ${crop.value.trim()}` : ''
    ].filter(Boolean).join(' | ');

    const plotData = {
      organizationId: orgId.value,
      name: name.value.trim(),
      description: description,
      area: area.value.trim(),
      location: locationTxt.value.trim(),
      crop: crop.value.trim()
    };

    const updatedPlot = await plotService.updatePlot(plotId, plotData);
    
    // Only redirect if updatePlot was successful (didn't throw)
    const successKey = updatedPlot.messageKey ? `auth.${updatedPlot.messageKey}` : 'organization.plotUpdateSuccess';
    toast.add({ severity: 'success', summary: t(successKey), life: 3000 });
    
    router.push({ name: 'organization-detail', params: { id: orgId.value } });
  } catch (err) {
    console.error('❌ Error updating plot:', err);
    const msgKey = err?.response?.data?.message;
    const summary = msgKey ? t(`auth.${msgKey}`) : t('organization.plotUpdateError');
    toast.add({ severity: 'error', summary, life: 3000 });
    plotService.clearError();
  }
}

function goBack() {
  if (orgId.value) {
    router.push({ name: 'organization-detail', params: { id: orgId.value } });
  } else {
    router.push({ name: 'dashboard' });
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <h2 class="page-title">{{ $t('organizationExt.editPlot') }}</h2>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ $t('organizationExt.loadingPlot') }}</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error && !currentPlot" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          :label="$t('common.back')"
          icon="pi pi-arrow-left"
          @click="goBack"
          class="p-button-outlined"
        />
      </div>

      <!-- Formulario de edición -->
      <div v-if="currentPlot && !loading" class="form-container">
        <!-- Panel: Datos -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-pencil mr-2 text-orange-500"></i>
              <span>{{ $t('organizationExt.plotData') }}</span>
            </div>
          </template>
          <template #content>
            <div class="p-fluid">
              <label class="label">{{ $t('organization.name') }}</label>
              <InputText v-model="name" :placeholder="$t('organization.name')" class="mb-3" />

              <label class="label">{{ $t('organization.area') }}</label>
              <InputText v-model="area" :placeholder="$t('organization.areaPlaceholder')" class="mb-3" />

              <label class="label">{{ $t('organization.location') }}</label>
              <InputText v-model="locationTxt" :placeholder="$t('organization.location')" class="mb-3" />

              <label class="label">{{ $t('organization.crop') }}</label>
              <InputText v-model="crop" :placeholder="$t('organization.crop')" />
            </div>
          </template>
        </Card>
      </div>

      <div class="actions" v-if="currentPlot">
        <Button
          :label="$t('common.cancel')"
          class="p-button-outlined btn-cancel"
          @click="goBack"
        />
        <Button
          :label="$t('reports.update')"
          class="btn-primary"
          @click="updatePlot"
          :loading="loading"
        />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap{max-width:1000px;margin:0 auto}
.page-title{margin:12px 0 22px 0;text-align:center;color:#111}

.panel{background:#fff;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.08);color:#111}
.panel-title{display:flex;align-items:center;font-weight:700;color:#111}
.label{display:block;font-weight:600;margin-bottom:6px;color:#111}

/* inputs primevue blancos y texto negro */
:deep(.p-inputtext){ background:#fff !important; color:#111 !important; border-color:#d1d5db; }
:deep(.p-inputtext::placeholder){ color:#9ca3af; }

.actions{display:flex;justify-content:center;gap:1rem;margin-top:28px}
.btn-primary{min-width:160px}
.btn-cancel{min-width:120px}

.form-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.panel {
  width: 100%;
  max-width: 600px;
}

.loading-state, .error-state {
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

.loading-state p, .error-state p {
  margin: 1rem 0;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 940px){
  .grid{grid-template-columns:1fr}
}
</style>
