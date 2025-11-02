<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { organizationService } from '../../application/organization.service.js';
import AppLayout from '../../../shared/presentation/components/app-layout.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';

const { t } = useI18n();

const name = ref('');
const description = ref('');
const locationTxt = ref('');

// Estados del servicio
const loading = computed(() => organizationService.state.loading);
const error = computed(() => organizationService.state.error);

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

const router = useRouter();

async function createOrg() {
  if (!name.value.trim()) {
    alert(t('organization.name'));
    return;
  }

  try {
    const organizationData = {
      name: name.value.trim(),
      description: description.value.trim(),
      location: locationTxt.value.trim()
    };

    await organizationService.createOrganization(organizationData);
    router.push({ name: 'dashboard' });
  } catch (err) {
    console.error('Error creating organization:', err);
    alert(t('common.unexpectedError'));
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <h2 class="page-title">{{ t('organization.create') }}</h2>

      <div class="grid">
        <!-- Panel: Datos -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-user mr-2 text-orange-500"></i>
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

        <!-- Panel: Miembros -->
        <Card class="panel">
          <template #title>
            <div class="panel-title">
              <i class="pi pi-user mr-2 text-orange-500"></i>
              <span>{{ t('organization.members') }}:</span>
            </div>
          </template>
          <template #content>
            <div class="search-box mb-3">
              <i class="pi pi-search"></i>
              <InputText v-model="search" :placeholder="t('organization.searchMembers')" class="w-full" />
            </div>

            <div class="member-list">
              <div v-for="m in filtered" :key="m.id" class="member-row">
                <div class="left" @click="toggleMember(m.id)">
                  <Avatar :image="m.avatar" shape="circle" class="mr-2" />
                  <span class="member-name">{{ m.name }}</span>
                </div>
                <div class="right">
                  <i
                      v-if="selected.includes(m.id)"
                      class="pi pi-check-circle selected"
                      :title="t('organization.selected')"
                      @click="toggleMember(m.id)"
                  />
                  <i class="pi pi-trash del" :title="t('organization.remove')" @click="removeMember(m.id)" />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="actions">
        <Button :label="t('common.create')" class="btn-primary" @click="createOrg" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap{max-width:1000px;margin:0 auto}
.page-title{margin:12px 0 22px 0;text-align:center;color:#111}

/* panel y textos en negro */
.panel{background:#fff;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.08);color:#111}
.panel-title{display:flex;align-items:center;font-weight:700;color:#111}
.label{display:block;font-weight:600;margin-bottom:6px;color:#111}

/* inputs PrimeVue siempre blancos con texto negro */
:deep(.p-inputtext){
  background:#fff !important;
  color:#111 !important;
  border-color:#d1d5db;
}
:deep(.p-inputtext::placeholder){ color:#9ca3af; }

/* buscador */
.search-box{position:relative}
.search-box i{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:#94a3b8}

/* lista miembros */
.member-list{display:flex;flex-direction:column;gap:10px;max-height:320px;overflow:auto;padding-right:6px}
.member-row{
  background:#fff;border:1px solid #e5e7eb;border-radius:10px;
  padding:10px 12px;display:flex;align-items:center;justify-content:space-between;color:#111
}
.member-row .left{display:flex;align-items:center;gap:10px;cursor:pointer}
.member-name{color:#111}   /* ← nombre bien legible */
.member-row .right{display:flex;align-items:center;gap:12px}
.selected{color:#16a34a;font-size:1.25rem;cursor:pointer}
.del{color:#111;font-size:1.1rem;cursor:pointer}

.actions{display:flex;justify-content:center;margin-top:28px}
.btn-primary{min-width:160px}

.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media (max-width: 940px){
  .grid{grid-template-columns:1fr}
}
</style>
