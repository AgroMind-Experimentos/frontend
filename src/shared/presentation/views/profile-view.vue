<script setup>
import { ref, onMounted } from 'vue';
import AppLayout from '../components/app-layout.vue';
import { UserProfileApi } from '../../../profile/infrastructure/user-profile-api.js';
import { userStore } from '../../../iam/application/user.store.js';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const api = new UserProfileApi();

const name        = ref('');
const email       = ref('');
const loading     = ref(false);
const saving      = ref(false);
const profileError   = ref('');
const profileSuccess = ref('');

const currentPassword = ref('');
const newPassword     = ref('');
const confirmNew      = ref('');
const savingPwd       = ref(false);
const pwdError        = ref('');
const pwdSuccess      = ref('');

onMounted(async () => {
  loading.value = true;
  try {
    const profile = await api.getMe();
    name.value  = profile.displayName || profile.name || '';
    email.value = profile.email ?? '';
  } catch {
    profileError.value = 'No se pudo cargar el perfil.';
  } finally {
    loading.value = false;
  }
});

async function saveProfile() {
  profileError.value = '';
  profileSuccess.value = '';
  if (!name.value.trim()) { profileError.value = 'El nombre es obligatorio.'; return; }
  saving.value = true;
  try {
    await api.updateById(userStore.state.user?.id, {
      displayName: name.value.trim(),
      email: email.value.trim(),
    });
    profileSuccess.value = 'Perfil actualizado correctamente.';
  } catch {
    profileError.value = 'Error al guardar el perfil.';
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  pwdError.value = '';
  pwdSuccess.value = '';
  if (!currentPassword.value || !newPassword.value) {
    pwdError.value = 'Completa todos los campos.'; return;
  }
  if (newPassword.value !== confirmNew.value) {
    pwdError.value = 'Las contraseñas no coinciden.'; return;
  }
  savingPwd.value = true;
  try {
    await api.changePassword(currentPassword.value, newPassword.value);
    pwdSuccess.value = 'Contraseña actualizada correctamente.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmNew.value = '';
  } catch (err) {
    pwdError.value = err?.response?.data?.message || 'Error al cambiar la contraseña.';
  } finally {
    savingPwd.value = false;
  }
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <div class="avatar-box">
        <div class="avatar"><i class="pi pi-user avatar-icon"></i></div>
      </div>

      <div v-if="loading" class="loading-msg">
        <i class="pi pi-spin pi-spinner"></i> Cargando perfil…
      </div>

      <template v-else>
        <!-- Sección: datos de perfil -->
        <Card class="profile-card">
          <template #title><span class="section-title">Información personal</span></template>
          <template #content>
            <div class="form-grid">
              <div class="field">
                <label class="lbl">{{ $t('sharedExt.names') }}</label>
                <InputText v-model="name" :placeholder="$t('organization.name')" class="w-full" />
              </div>
              <div class="field">
                <label class="lbl">{{ $t('sharedExt.email') }}</label>
                <InputText v-model="email" :placeholder="$t('sharedExt.email')" class="w-full" />
              </div>
            </div>
            <div v-if="profileError"   class="msg error">  <i class="pi pi-exclamation-circle"></i> {{ profileError }}</div>
            <div v-if="profileSuccess" class="msg success"><i class="pi pi-check-circle"></i>       {{ profileSuccess }}</div>
          </template>
        </Card>
        <div class="actions">
          <Button label="Guardar perfil" class="btn-save" :loading="saving" @click="saveProfile" />
        </div>

        <!-- Sección: cambio de contraseña -->
        <Card class="profile-card">
          <template #title><span class="section-title">Cambiar contraseña</span></template>
          <template #content>
            <div class="form-grid">
              <div class="field">
                <label class="lbl">Contraseña actual</label>
                <Password v-model="currentPassword" :feedback="false" toggleMask inputClass="w-full" class="w-full" placeholder="Contraseña actual" />
              </div>
              <div class="field">
                <label class="lbl">Nueva contraseña</label>
                <Password v-model="newPassword" :feedback="false" toggleMask inputClass="w-full" class="w-full" placeholder="Nueva contraseña" />
              </div>
              <div class="field">
                <label class="lbl">Confirmar nueva contraseña</label>
                <Password v-model="confirmNew" :feedback="false" toggleMask inputClass="w-full" class="w-full" placeholder="Confirmar contraseña" />
              </div>
            </div>
            <div v-if="pwdError"   class="msg error">  <i class="pi pi-exclamation-circle"></i> {{ pwdError }}</div>
            <div v-if="pwdSuccess" class="msg success"><i class="pi pi-check-circle"></i>       {{ pwdSuccess }}</div>
          </template>
        </Card>
        <div class="actions">
          <Button label="Cambiar contraseña" class="btn-save" :loading="savingPwd" @click="changePassword" />
        </div>
      </template>
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
.section-title { font-size: 1rem; font-weight: 700; color: #2c5530; }
.form-grid { display: flex; flex-direction: column; gap: 18px; padding: 10px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.lbl { font-weight: 600; color: #444; font-size: .9rem; }

.msg { display: flex; align-items: center; gap: .5rem; padding: .65rem .9rem; border-radius: 8px; font-size: .9rem; margin-top: 1rem; }
.msg.error   { background: #fee2e2; color: #991b1b; }
.msg.success { background: #d1fae5; color: #065f46; }

.actions { display: flex; justify-content: flex-end; margin: 10px 6px 18px 6px; }
.btn-save { min-width: 180px; }

:deep(.p-inputtext), :deep(.p-password-input) { background: #fff !important; color: #111 !important; border-color: #d1d5db; width: 100%; }
:deep(.p-inputtext::placeholder) { color: #9ca3af; }
:deep(.p-password) { width: 100%; }
</style>
