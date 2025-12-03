<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { plotService } from '../../application/plot.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

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

// ---- Miembros (mock) ----
const allMembers = ref([
  { id: 1, name: 'Miembro 1', avatar: 'https://i.pravatar.cc/100?img=12' },
  { id: 2, name: 'Miembro 2', avatar: 'https://i.pravatar.cc/100?img=32' },
  { id: 3, name: 'Ana Torres', avatar: 'https://i.pravatar.cc/100?img=21' },
  { id: 4, name: 'Luis Paredes', avatar: 'https://i.pravatar.cc/100?img=41' }
]);

const search = ref('');
const selected = ref([]);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return allMembers.value;
  return allMembers.value.filter(m => m.name.toLowerCase().includes(q));
});

onMounted(async () => {
  try {
    await plotService.getPlotById(plotId);
    // Llenar el formulario con los datos actuales
    if (currentPlot.value) {
      name.value = currentPlot.value.name;
      area.value = currentPlot.value.area;
      locationTxt.value = currentPlot.value.location;
      crop.value = currentPlot.value.crop;
      selected.value = currentPlot.value.members.map(id => parseInt(id));
    }
  } catch (err) {
    console.error('Error loading plot:', err);
  }
});

function toggleMember(id) {
  const i = selected.value.indexOf(id);
  if (i >= 0) selected.value.splice(i, 1);
  else selected.value.push(id);
}

function removeMember(id) {
  selected.value = selected.value.filter(x => x !== id);
}

async function updateParcel() {
  if (!name.value.trim()) {
    alert('Ingresa el nombre de la parcela');
    return;
  }

  try {
    // Construir la descripción con toda la información
    const description = [
      area.value.trim() ? `Área: ${area.value.trim()}` : '',
      locationTxt.value.trim() ? `Ubicación: ${locationTxt.value.trim()}` : '',
      crop.value.trim() ? `Cultivo: ${crop.value.trim()}` : '',
      selected.value.length > 0 ? `Miembros: ${selected.value.length}` : ''
    ].filter(Boolean).join(' | ');

    const plotData = {
      organizationId: currentPlot.value.organizationId,
      name: name.value.trim(),
      description: description,
      // Campos adicionales para el estado local
      area: area.value.trim(),
      location: locationTxt.value.trim(),
      crop: crop.value.trim(),
      members: selected.value.map(id => String(id))
    };

    console.log('🚀 Actualizando parcela con datos:', plotData);
    await plotService.updatePlot(plotId, plotData);
    console.log('✅ Parcela actualizada exitosamente');

    alert('Parcela actualizada exitosamente!');
    // Redirigir al detalle de la organización
    router.push({ name: 'organization-detail', params: { id: currentPlot.value.organizationId } });
  } catch (err) {
    console.error('❌ Error updating plot:', err);
    alert(`Error al actualizar la parcela: ${err.message || 'Error desconocido'}`);
  }
}

function goBack() {
  if (currentPlot.value) {
    router.push({ name: 'organization-detail', params: { id: currentPlot.value.organizationId } });
  } else {
    router.push({ name: 'dashboard' });
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <h2 class="page-title">Editar Parcela</h2>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando datos de la parcela...</p>
      </div>

      <!-- Estado de error -->
      <div v-else-if="error" class="error-state">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #e74c3c"></i>
        <p>{{ error }}</p>
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          @click="goBack"
          class="p-button-outlined"
        />
      </div>

      <!-- Formulario de edición -->
      <div v-else-if="currentPlot" class="grid">
        <!-- Panel: Datos -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-pencil mr-2 text-orange-500"></i>
              <span>Datos de la Parcela:</span>
            </div>
          </template>
          <template #content>
            <div class="p-fluid">
              <label class="label">Nombre</label>
              <InputText v-model="name" placeholder="Nombre" class="mb-3" />

              <label class="label">Área</label>
              <InputText v-model="area" placeholder="Área (ej: 5.2 ha)" class="mb-3" />

              <label class="label">Ubicación</label>
              <InputText v-model="locationTxt" placeholder="Ubicación" class="mb-3" />

              <label class="label">Cultivo</label>
              <InputText v-model="crop" placeholder="Cultivo" />
            </div>
          </template>
        </Card>

        <!-- Panel: Miembros -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-users mr-2 text-orange-500"></i>
              <span>Miembros Asignados:</span>
            </div>
          </template>
          <template #content>
            <div class="search-box mb-3">
              <i class="pi pi-search"></i>
              <InputText v-model="search" placeholder="Buscar miembros" class="w-full" />
            </div>

            <div class="member-list">
              <div v-for="m in filtered" :key="m.id" class="member-row">
                <div class="left" @click="toggleMember(m.id)">
                  <Avatar :image="m.avatar" shape="circle" class="mr-2" />
                  <span class="member-name">{{ m.name }}</span>
                </div>
                <div class="right">
                  <i v-if="selected.includes(m.id)" class="pi pi-check-circle selected" @click="toggleMember(m.id)" />
                  <i class="pi pi-trash del" @click="removeMember(m.id)" />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="actions" v-if="currentPlot">
        <Button
          label="Cancelar"
          class="p-button-outlined btn-cancel"
          @click="goBack"
        />
        <Button
          label="Actualizar"
          class="btn-primary"
          @click="updateParcel"
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

.search-box{position:relative}
.search-box i{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#94a3b8}

.member-list{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow:auto;padding-right:6px}
.member-row{
  background:#fff;border:1px solid #e5e7eb;border-radius:10px;
  padding:10px 12px;display:flex;align-items:center;justify-content:space-between;color:#111
}
.member-row .left{display:flex;align-items:center;gap:10px;cursor:pointer}
.member-name{color:#111}
.member-row .right{display:flex;align-items:center;gap:12px}
.selected{color:#16a34a;font-size:1.25rem;cursor:pointer}
.del{color:#111;font-size:1.1rem;cursor:pointer}

.actions{display:flex;justify-content:center;gap:1rem;margin-top:28px}
.btn-primary{min-width:160px}
.btn-cancel{min-width:120px}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}

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
