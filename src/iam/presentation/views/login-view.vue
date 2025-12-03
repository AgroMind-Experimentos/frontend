<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { userStore } from '../../application/user.store.js';

// PrimeVue
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Card from 'primevue/card';

export default {
  name: 'login-view',
  components: { InputText, Password, Button, Card },
  setup() {
    const router = useRouter();

    // Form state
    const email = ref('');
    const password = ref('');

    // Store state
    const loading = computed(() => userStore.state.loading);
    const errorKey = computed(() => userStore.state.errorKey);

    // Logo desde Catbox (tu link)
    const logoUrl = 'https://files.catbox.moe/2ws3bu.png';

    // Actions
    const goRegister = () => router.push({ name: 'user-register' });
    const submit = async () => {
      if (loading.value) return;
      const ok = await userStore.login({
        email: email.value.trim(),
        password: password.value
      });
      if (ok) router.push('/dashboard');
    };

    return { email, password, loading, errorKey, submit, goRegister, logoUrl };
  }
};
</script>

<template>
  <!-- Fondo con gradiente más suave -->
  <div class="login-container">
    <div class="flex align-items-center justify-content-center min-h-screen p-4 card-wrapper">
      <!-- Tarjeta mejorada -->
      <Card class="login-card">
        <!-- Header con logo mejorado -->
        <template #header>
          <div class="logo-container">
            <div class="avatar-circle">
              <img :src="logoUrl" alt="EcoTrack" class="avatar-img" />
            </div>
          </div>
        </template>

        <!-- Título mejorado -->
        <template #title>
          <div class="title-section">
            <h1 class="login-title">Iniciar Sesión</h1>
            <p class="login-subtitle">¡Bienvenido de vuelta!</p>
          </div>
        </template>

        <!-- Contenido del formulario -->
        <template #content>
          <form @submit.prevent="submit" class="login-form">
            <!-- Campo de correo -->
            <div class="form-field">
              <label class="field-label">Correo electrónico</label>
              <InputText
                v-model="email"
                placeholder="ejemplo@correo.com"
                type="email"
                class="form-input"
                :class="{ 'p-invalid': errorKey }"
              />
            </div>

            <!-- Campo de contraseña -->
            <div class="form-field">
              <label class="field-label">Contraseña</label>
              <Password
                v-model="password"
                :feedback="false"
                toggleMask
                placeholder="Ingresa tu contraseña"
                inputClass="form-input-password"
                class="password-field"
                :class="{ 'p-invalid': errorKey }"
              />
            </div>

            <!-- Mensaje de error -->
            <div v-if="errorKey" class="error-message">
              <i class="pi pi-exclamation-triangle"></i>
              {{ $t ? $t(errorKey) : 'Credenciales inválidas. Verifica tus datos.' }}
            </div>

            <!-- Botón principal -->
            <Button
              type="submit"
              label="Iniciar Sesión"
              class="login-button"
              :loading="loading"
              :disabled="!email || !password"
            />

            <!-- Divider -->
            <div class="divider">
              <span>o</span>
            </div>

            <!-- Enlace a registro -->
            <div class="register-link">
              <span class="text-secondary">¿No tienes cuenta?</span>
              <Button
                label="Crear cuenta"
                class="p-button-link register-button"
                @click="goRegister"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%);
  min-height: 100vh;
  position: relative;
}

.login-container::before {
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
  padding-top: 3rem !important;
  padding-bottom: 3rem !important;
}

.login-card {
  margin: auto;
  width: 100%;
  max-width: 480px;
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
  border-radius: 50%;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 8px 25px rgba(46, 125, 50, 0.3),
    0 4px 10px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.avatar-circle:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 35px rgba(46, 125, 50, 0.4),
    0 6px 15px rgba(0, 0, 0, 0.15);
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

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1B5E20;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.login-form {
  padding: 0 2rem 2rem 2rem;
}

.form-field {
  margin-bottom: 1.5rem;
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

.login-button {
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

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #1B5E20, #2E7D32) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3) !important;
}

.login-button:disabled {
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

.register-link {
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

.register-button {
  padding: 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #2E7D32 !important;
  text-decoration: none !important;
}

.register-button:hover {
  color: #1B5E20 !important;
  .card-wrapper {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }

  text-decoration: underline !important;
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    max-width: 100%;
    margin: 1rem;
    border-radius: 16px !important;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .login-form {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
  }
}
</style>
