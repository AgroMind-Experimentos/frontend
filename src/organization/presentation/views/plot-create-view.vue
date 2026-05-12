<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { plotService } from '../../application/plot.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

// Id de organización (obligatorio para crear parcela)
const route = useRoute();
const router = useRouter();
const orgId = route.query.orgId ?? null;

// Estados del servicio
const loading = computed(() => plotService.state.loading);
const error = computed(() => plotService.state.error);
const successMessage = ref('');
const errorMessage = ref('');

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

function toggleMember(id) {
  const i = selected.value.indexOf(id);
  if (i >= 0) selected.value.splice(i, 1);
  else selected.value.push(id);
}
function removeMember(id) {
  selected.value = selected.value.filter(x => x !== id);
}

async function createParcel() {
  errorMessage.value = '';
  successMessage.value = '';

  if (!name.value.trim()) {
    errorMessage.value = 'El nombre de la parcela es obligatorio';

    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);

    return;
  }

  if (!orgId) {
    errorMessage.value = 'ID de organización requerido';

    setTimeout(() => {
      errorMessage.value = '';
    }, 3000);

    return;
  }

  try {
    const description = [
      area.value.trim() ? `Área: ${area.value.trim()}` : '',
      locationTxt.value.trim() ? `Ubicación: ${locationTxt.value.trim()}` : '',
      crop.value.trim() ? `Cultivo: ${crop.value.trim()}` : '',
      selected.value.length > 0 ? `Miembros: ${selected.value.length}` : ''
    ].filter(Boolean).join(' | ');

    const plotData = {
      organizationId: orgId,
      name: name.value.trim(),
      description: description,
      area: area.value.trim(),
      location: locationTxt.value.trim(),
      crop: crop.value.trim(),
      members: selected.value.map(id => String(id))
    };

    console.log('🚀 Creando parcela con datos:', plotData);

    await plotService.createPlot(plotData);

    console.log('✅ Parcela creada exitosamente');

    successMessage.value = '✅ Parcela creada exitosamente';

    setTimeout(() => {
      router.push({
        name: 'organization-detail',
        params: { id: orgId }
      });
    }, 1500);

  } catch (err) {
    console.error('❌ Error creating plot:', err);

    errorMessage.value =
        `❌ ${err.message || 'Error al crear la parcela'}`;

    setTimeout(() => {
      errorMessage.value = '';
    }, 4000);
  }
}

function goBack() {
  if (orgId) {
    router.push({ name: 'organization-detail', params: { id: orgId } });
  } else {
    router.push({ name: 'dashboard' });
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <div v-if="successMessage" class="success-box">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </div>
      <h2 class="page-title">Crear Parcela</h2>

      <div class="grid">
        <!-- Panel: Datos -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-user mr-2 text-orange-500"></i>
              <span>Datos:</span>
            </div>
          </template>
          <template #content>
            <div class="p-fluid">
              <label class="label">Nombre</label>
              <InputText v-model="name" placeholder="Nombre" class="mb-3" />

              <label class="label">Área</label>
              <InputText v-model="area" placeholder="Área" class="mb-3" />

              <label class="label">Ubicacion</label>
              <InputText v-model="locationTxt" placeholder="Ubicacion" class="mb-3" />

              <label class="label">Cultivo</label>
              <InputText v-model="crop" placeholder="Cultivo" />
            </div>
          </template>
        </Card>


      </div>

      <div class="actions">
        <Button label="Crear" class="btn-primary" @click="createParcel" />
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

.actions{display:flex;justify-content:center;margin-top:28px}
.btn-primary{min-width:160px}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media (max-width: 940px){
  .grid{grid-template-columns:1fr}
}
.success-box{
  background:#dcfce7;
  color:#166534;
  padding:14px;
  border-radius:10px;
  margin-bottom:18px;
  border:1px solid #86efac;
  font-weight:600;
}

.error-box{
  background:#fee2e2;
  color:#991b1b;
  padding:14px;
  border-radius:10px;
  margin-bottom:18px;
  border:1px solid #fca5a5;
  font-weight:600;
}
</style>
