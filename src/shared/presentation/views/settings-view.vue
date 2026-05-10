<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppLayout from '../components/app-layout.vue';

// PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';

// i18n
const { locale } = useI18n();

// Estado UI
const activePanel = ref('subscription'); // 'subscription' | 'language'
const notifications = ref(true);

// Aplica idioma (misma lógica que language-switcher)
function applyLanguage(lang) {
  locale.value = lang;
}

// Acciones (placeholders)
function changePlan() { alert('Cambiar plan (WIP)'); }
function cancelPlan() { alert('Cancelar plan (WIP)'); }
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <div class="grid">
        <!-- Panel izquierdo -->
        <Card class="left-card">
          <template #title>
            <div class="card-title">{{ $t('sharedExt.settingsTitle') }}</div>
          </template>
          <template #content>
            <div class="stack">
              <Button
                  :label="$t('settings.subscription')"
                  class="w-full"
                  :severity="activePanel === 'subscription' ? undefined : 'secondary'"
                  @click="activePanel = 'subscription'"
              />
              <Button
                  :label="$t('settings.changeLanguage')"
                  class="w-full"
                  :severity="activePanel === 'language' ? undefined : 'secondary'"
                  @click="activePanel = 'language'"
              />

              <div class="notif">
                <span>{{ $t('settings.notifications') }}</span>
                <InputSwitch v-model="notifications" />
              </div>
            </div>
          </template>
        </Card>

        <!-- Panel derecho -->
        <Card class="right-card">
          <!-- Suscripción -->
          <template v-if="activePanel === 'subscription'" #title>
            <div class="card-title">{{ $t('settings.currentPlan') }}</div>
          </template>
          <template v-if="activePanel === 'subscription'" #content>
            <div class="subgrid">
              <div class="row">
                <div class="label">{{ $t('settings.plan') }}</div>
                <div class="value">{{ $t('settings.plan') }}</div>
              </div>
              <div class="row">
                <div class="label">{{ $t('settings.paymentDate') }}</div>
                <div class="value">{{ $t('settings.ddmm') }}</div>
              </div>

              <div class="actions">
                <Button :label="$t('settings.changePlan')" severity="warning" @click="changePlan" />
                <Button :label="$t('settings.cancelPlan')" severity="secondary" disabled @click="cancelPlan" />
              </div>
            </div>
          </template>

          <!-- Idioma -->
          <template v-if="activePanel === 'language'" #title>
            <div class="card-title">{{ $t('settings.selectLanguage') }}</div>
          </template>
          <template v-if="activePanel === 'language'" #content>
            <div class="lang">
              <Button
                  :label="$t('settings.spanish')"
                  :severity="locale === 'es' ? 'warning' : 'secondary'"
                  @click="applyLanguage('es')"
              />
              <Button
                  :label="$t('settings.english')"
                  :severity="locale === 'en' ? 'warning' : 'secondary'"
                  @click="applyLanguage('en')"
              />
            </div>
            <small class="hint">{{ $t('settings.appliesImmediately') }}</small>
          </template>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap { max-width: 1100px; margin: 0 auto; }
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 22px;
  margin-top: 14px;
}

.left-card, .right-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(0,0,0,.06);
  color: #111;
}
.card-title { font-weight: 800; color: #111; }

.stack { display: flex; flex-direction: column; gap: 14px; }
.notif {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 8px; border-top: 1px dashed #e5e7eb; margin-top: 8px; color: #111;
}

.subgrid { display: grid; gap: 12px; }
.row { display: grid; grid-template-columns: 160px 1fr; gap: 10px; align-items: center; }
.label { font-weight: 700; color: #111; }
.value { color: #111; }

.actions { display: flex; gap: 10px; margin-top: 8px; }

.lang { display: flex; gap: 12px; }
.hint { display: block; margin-top: 10px; color: #6b7280; }

@media (max-width: 920px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
