<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/app-layout.vue';
import { UserProfileApi } from '../../../profile/infrastructure/user-profile-api.js';

// PrimeVue
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const api = new UserProfileApi();

const name    = ref('');
const email   = ref('');
const password = ref('');
const loading  = ref(false);
const saving   = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    const profile = await api.getMe();
    name.value  = profile.name  ?? '';
    email.value = profile.email ?? '';
  } catch {
    errorMsg.value = 'No se pudo cargar el perfil.';
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  errorMsg.value = '';
  successMsg.value = '';
  if (!name.value.trim()) { errorMsg.value = 'El nombre es obligatorio.'; return; }
  saving.value = true;
  try {
    const payload = { name: name.value.trim(), email: email.value.trim() };
    if (password.value) payload.password = password.value;
    await api.updateMe(payload);
    successMsg.value = 'Perfil actualizado correctamente.';
    password.value = '';
  } catch {
    errorMsg.value = 'Error al guardar el perfil.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <div class="avatar-box">
        <div class="avatar"><i class="pi pi-user avatar-icon"></i></div>
      </div>

      <div v-if="loading" class="loading-msg"><i class="pi pi-spin pi-spinner"></i> Cargando perfil…</div>

      <Card v-else class="profile-card">
        <template #content>
          <div class="form-grid">
            <div class="field span-2">
              <label class="lbl">{{ $t('sharedExt.names') }}</label>
              <InputText v-model="name" :placeholder="$t('organization.name')" class="w-full" />
            </div>

            <div class="field span-2">
              <label class="lbl">{{ $t('sharedExt.email') }}</label>
              <InputText v-model="email" :placeholder="$t('sharedExt.email')" class="w-full" />
            </div>

            <div class="field span-2">
              <label class="lbl">{{ $t('sharedExt.password') }}</label>
              <Password v-model="password" :feedback="false" toggleMask inputClass="w-full" class="w-full" placeholder="Nueva contraseña (opcional)" />
            </div>
          </div>

          <div v-if="errorMsg" class="msg error"><i class="pi pi-exclamation-circle"></i> {{ errorMsg }}</div>
          <div v-if="successMsg" class="msg success"><i class="pi pi-check-circle"></i> {{ successMsg }}</div>
        </template>
      </Card>

      <div class="actions">
        <Button :label="$t('common.save')" class="btn-save" :loading="saving" :disabled="loading" @click="saveProfile" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap { max-width: 560px; margin: 0 auto; }
.avatar-box { display: flex; justify-content: center; margin-top: 18px; }
.avatar {
  width: 120px; height: 120px; border-radius: 50%;
  background: #2c5530; border: 3px solid #3b82f6;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;
}
.avatar-icon { font-size: 3rem; color: #fff; }

.loading-msg { text-align: center; color: #6b7280; margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap: .5rem; }

.profile-card { margin-top: 18px; background: #fff; border-radius: 16px; box-shadow: 0 10px 22px rgba(0,0,0,.06); color: #111; }
.form-grid { display: flex; flex-direction: column; gap: 18px; padding: 10px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-weight: 600; color: #444; font-size: .9rem; }
.span-2 { width: 100%; }

.msg { display: flex; align-items: center; gap: .5rem; padding: .65rem .9rem; border-radius: 8px; font-size: .9rem; margin-top: 1rem; }
.msg.error   { background: #fee2e2; color: #991b1b; }
.msg.success { background: #d1fae5; color: #065f46; }

.actions { display: flex; justify-content: flex-end; margin: 22px 6px 0 6px; }
.btn-save { min-width: 150px; }

:deep(.p-inputtext), :deep(.p-password-input) { background: #fff !important; color: #111 !important; border-color: #d1d5db; width: 100%; }
:deep(.p-inputtext::placeholder) { color: #9ca3af; }
:deep(.p-password) { width: 100%; }
</style>
