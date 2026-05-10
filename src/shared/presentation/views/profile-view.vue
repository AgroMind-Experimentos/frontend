<script setup>
import { ref } from 'vue';
import AppLayout from '../components/app-layout.vue';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { userStore } from '../../../iam/application/user.store.js';

// PrimeVue
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Datos iniciales (mock desde el store si existe)
const current = userStore.state.user ?? { name: 'Juan', email: 'juan@example.com' };
const nombres = ref(current.name || '');
const apellidos = ref('');
const correo = ref(current.email || '');
const password = ref(''); // por seguridad, se deja vacío
const rol = ref(null);
const { t } = useI18n();
const roles = computed(() => [
  { label: t('iam.agronomist'), value: 'agronomo' },
  { label: t('iam.farmer'), value: 'agricultor' }
]);

// Avatar
const defaultAvatar = 'https://files.catbox.moe/7kr0f6.png';
const avatarUrl = ref(defaultAvatar);
const fileInput = ref(null);

function pickPhoto() {
  fileInput.value?.click();
}
function onPhotoSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => (avatarUrl.value = reader.result);
  reader.readAsDataURL(file);
}

// Guardar (placeholder)
function saveProfile() {
  // Aquí harías: await userStore.updateProfile({ nombres, apellidos, correo, password, rol, avatar })
  alert('Perfil guardado (placeholder)');
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <!-- Avatar + Editar foto -->
      <div class="avatar-box">
        <img :src="avatarUrl" alt="Avatar" class="avatar" />
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPhotoSelected" />
        <Button :label="$t('sharedExt.editPhoto')" class="btn-edit" @click="pickPhoto" />
      </div>

      <!-- Card con formulario -->
      <Card class="profile-card">
        <template #content>
          <div class="form-grid">
            <div class="field">
              <label class="lbl">{{ $t('sharedExt.names') }}</label>
              <InputText v-model="nombres" :placeholder="$t('organization.name')" class="w-full" />
            </div>

            <div class="field">
              <label class="lbl">{{ $t('sharedExt.password') }}</label>
              <Password v-model="password" :feedback="false" toggleMask inputClass="w-full" class="w-full" placeholder="********" />
            </div>

            <div class="field">
              <label class="lbl">{{ $t('sharedExt.lastName') }}</label>
              <InputText v-model="apellidos" :placeholder="$t('sharedExt.lastName')" class="w-full" />
            </div>

            <div class="field">
              <label class="lbl">{{ $t('sharedExt.role') }}</label>
              <Dropdown v-model="rol" :options="roles" optionLabel="label" optionValue="value" :placeholder="$t('sharedExt.role')" class="w-full" />
            </div>

            <div class="field span-2">
              <label class="lbl">{{ $t('sharedExt.email') }}</label>
              <InputText v-model="correo" :placeholder="$t('sharedExt.email')" class="w-full" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Guardar -->
      <div class="actions">
        <Button :label="$t('common.save')" class="btn-save" @click="saveProfile" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap { max-width: 980px; margin: 0 auto; }
.avatar-box { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 18px; }
.avatar {
  width: 140px; height: 140px; border-radius: 50%; object-fit: cover;
  border: 3px solid #3b82f6; /* aro azul suave */
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
}
.hidden { display: none; }
.btn-edit { background: #236d34; border: none; }

.profile-card {
  margin-top: 18px; background: #fff; border-radius: 16px;
  box-shadow: 0 10px 22px rgba(0,0,0,.06); color: #111;
}
.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 10px;
}
.field { display: flex; align-items: center; gap: 12px; }
.lbl { width: 120px; font-weight: 600; color: #111; text-align: right; }
.span-2 { grid-column: span 2; }

.actions { display: flex; justify-content: flex-end; margin: 22px 6px 0 6px; }
.btn-save { min-width: 150px; }

/* inputs PrimeVue blancos y texto negro */
:deep(.p-inputtext), :deep(.p-password-input), :deep(.p-dropdown .p-dropdown-label) {
  background: #fff !important; color: #111 !important; border-color: #d1d5db;
}
:deep(.p-inputtext::placeholder) { color: #9ca3af; }
</style>
