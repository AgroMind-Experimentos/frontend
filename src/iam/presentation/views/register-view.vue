<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { userStore } from '../../application/user.store.js';

// PrimeVue
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import RadioButton from 'primevue/radiobutton';
import Button from 'primevue/button';
import Card from 'primevue/card';

export default {
  name: 'register-view',
  components: { InputText, Password, RadioButton, Button, Card },
  setup() {
    const router = useRouter();

    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const role = ref('');

    const logoUrl = '/logo.png';

    const loading = computed(() => userStore.state.loading);
    const errorKey = computed(() => userStore.state.errorKey);
    const successKey = computed(() => userStore.state.successKey);

    const goLogin = () => router.push({ name: 'user-login' });

    const submit = async () => {
      if (!name.value || !email.value || !password.value || !confirmPassword.value) {
        alert('Completa todos los campos.');
        return;
      }
      if (password.value !== confirmPassword.value) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      if (!role.value) {
        alert('Selecciona un rol.');
        return;
      }

      const ok = await userStore.register({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: role.value
      });

      if (ok) {
        setTimeout(() => router.push({ name: 'user-login' }), 2000);
      }
    };

    return {
      name, email, password, confirmPassword,
      role, logoUrl, loading, errorKey, successKey, goLogin, submit
    };
  }
};
</script>

<template>
  <!-- Fondo con gradiente consistente -->
  <div class="register-container">
    <div class="flex align-items-center justify-content-center min-h-screen p-4 card-wrapper">
      <!-- Tarjeta de registro mejorada -->
      <Card class="register-card">
        <!-- Header con logo -->
        <template #header>
          <div class="logo-container">
            <div class="avatar-circle">
              <img :src="logoUrl" alt="EcoTrack" class="avatar-img" />
            </div>
          </div>
        </template>

        <!-- Título -->
        <template #title>
          <div class="title-section">
            <h1 class="register-title">{{ $t('iam.createAccount') }}</h1>
            <p class="register-subtitle">{{ $t('iam.joinCommunity') }}</p>
          </div>
        </template>

        <!-- Contenido del formulario -->
        <template #content>
          <form @submit.prevent="submit" class="register-form">
            <!-- Campo de nombre -->
            <div class="form-field">
              <label class="field-label">{{ $t('iam.fullName') }}</label>
              <InputText
                v-model="name"
                :placeholder="$t('iam.fullNamePlaceholder')"
                class="form-input"
              />
            </div>

            <!-- Campo de correo -->
            <div class="form-field">
              <label class="field-label">{{ $t('iam.email') }}</label>
              <InputText
                v-model="email"
                type="email"
                :placeholder="$t('iam.emailPlaceholder')"
                class="form-input"
              />
            </div>

            <!-- Campos de contraseña en fila -->
            <div class="password-row">
              <div class="form-field password-field-half">
                <label class="field-label">{{ $t('iam.password') }}</label>
                <Password
                  v-model="password"
                  :feedback="false"
                  toggleMask
                  :placeholder="$t('iam.password')"
                  inputClass="form-input-password"
                  class="password-field"
                />
              </div>

              <div class="form-field password-field-half">
                <label class="field-label">{{ $t('iam.confirmPassword') }}</label>
                <Password
                  v-model="confirmPassword"
                  :feedback="false"
                  toggleMask
                  :placeholder="$t('iam.confirmPassword')"
                  inputClass="form-input-password"
                  class="password-field"
                />
              </div>
            </div>

            <!-- Selección de rol -->
            <div class="roles-section">
              <label class="field-label">{{ $t('iam.userType') }}</label>
              <div class="roles-container">
                <div class="role-option" :class="{ active: role === 'Agronomist' }">
                  <RadioButton
                    v-model="role"
                    value="Agronomist"
                    inputId="role-agronomo"
                    class="role-checkbox"
                  />
                  <label for="role-agronomo" class="role-label">
                    <i class="pi pi-user-edit"></i>
                    <span>{{ $t('iam.agronomist') }}</span>
                    <small>{{ $t('iam.agronomistDesc') }}</small>
                  </label>
                </div>

                <div class="role-option" :class="{ active: role === 'Farmer' }">
                  <RadioButton
                    v-model="role"
                    value="Farmer"
                    inputId="role-agricultor"
                    class="role-checkbox"
                  />
                  <label for="role-agricultor" class="role-label">
                    <i class="pi pi-home"></i>
                    <span>{{ $t('iam.farmer') }}</span>
                    <small>{{ $t('iam.farmerDesc') }}</small>
                  </label>
                </div>
              </div>
            </div>

            <!-- Mensaje de error -->
            <div v-if="errorKey" class="error-message">
              <i class="pi pi-exclamation-triangle"></i>
              {{ $t ? $t(errorKey) : $t('iam.registerError') }}
            </div>

            <!-- Mensaje de éxito -->
            <div v-if="successKey" class="success-message">
              <i class="pi pi-check-circle"></i>
              {{ $t(successKey) }}
            </div>

            <!-- Botón de registro -->
            <Button
              type="submit"
              :label="$t('iam.createAccount')"
              class="register-button"
              :loading="loading"
              :disabled="!name || !email || !password || !confirmPassword || !role"
            />

            <!-- Divider -->
            <div class="divider">
              <span>{{ $t('iam.or') }}</span>
            </div>

            <!-- Enlace a login -->
            <div class="login-link">
              <span class="text-secondary">{{ $t('iam.alreadyHaveAccount') }}</span>
              <Button
                :label="$t('iam.login')"
                class="p-button-link login-button"
                @click="goLogin"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
  min-height: 100vh;
  overflow-y: auto;
  position: relative;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
}

.card-wrapper {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
  overflow-y: auto;
  align-items: flex-start !important;
}

.register-card {
  margin: auto;
  width: 100%;
  max-width: 580px;
  background: rgba(255, 255, 255, 0.98) !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  justify-content: center;
  padding: 2rem 0 1rem 0;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-section {
  text-align: center;
  padding: 0 2rem;
  margin-bottom: 1rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1B5E20;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.register-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.register-form {
  padding: 0 2rem 2rem 2rem;
}

.form-field {
  margin-bottom: 1.25rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem !important;
  border: 2px solid #E0E0E0 !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
  background: #FAFAFA !important;
}

.form-input:focus {
  border-color: #2E7D32 !important;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1) !important;
  background: #fff !important;
}

.password-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.password-field-half {
  flex: 1;
  margin-bottom: 0 !important;
}

.password-field {
  width: 100%;
}

.form-input-password {
  width: 100% !important;
  padding: 0.875rem 1rem !important;
  border: 2px solid #E0E0E0 !important;
  border-radius: 12px !important;
  font-size: 1rem !important;
  transition: all 0.3s ease !important;
  background: #FAFAFA !important;
}

.password-field:focus-within .form-input-password {
  border-color: #2E7D32 !important;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1) !important;
  background: #fff !important;
}

.roles-section {
  margin-bottom: 1.5rem;
}

.roles-container {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-option {
  flex: 1;
  border: 2px solid #E0E0E0;
  border-radius: 12px;
  padding: 1rem;
  background: #FAFAFA;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.role-option:hover {
  border-color: #C8E6C9;
  background: #F1F8E9;
}

.role-option.active {
  border-color: #2E7D32;
  background: #E8F5E8;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.role-checkbox {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
}

.role-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  cursor: pointer;
  padding-right: 1.5rem;
}

.role-label i {
  font-size: 1.5rem;
  color: #2E7D32;
}

.role-label span {
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
}

.role-label small {
  color: #666;
  font-size: 0.75rem;
}

.error-message {
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  color: #C62828;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.register-button {
  width: 100% !important;
  padding: 0.875rem !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #2E7D32, #4CAF50) !important;
  border: none !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  margin-bottom: 1.5rem;
}

.register-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3) !important;
}

.register-button:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #E0E0E0;
}

.divider span {
  background: #fff;
  padding: 0 1rem;
  color: #666;
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.login-link {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.text-secondary {
  color: #666;
  font-size: 0.875rem;
}

.login-button {
  padding: 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #2E7D32 !important;
  text-decoration: none !important;
}

.login-button:hover {
  color: #1B5E20 !important;
  text-decoration: underline !important;
}

/* Responsive */
@media (max-width: 768px) {
  .register-card {
    max-width: 100%;
    margin: 1rem;
    border-radius: 16px !important;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .register-form {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .password-row {
    flex-direction: column;
    gap: 0;
  }

  .password-field-half {
    margin-bottom: 1.25rem !important;
  }

  .roles-container {
    flex-direction: column;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 640px) {
  .role-label {
    padding-right: 0;
  }

  .role-checkbox {
    position: static;
    margin-top: 0.5rem;
  }

  .role-label {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
<style scoped>
.success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: fadeIn 0.3s ease-out;
}
</style>
