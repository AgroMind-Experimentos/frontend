<script setup>
import { useI18n } from 'vue-i18n';
import AppLayout from '../components/app-layout.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

const { locale, t } = useI18n();

function applyLanguage(lang) {
  locale.value = lang;
}
</script>

<template>
  <AppLayout>
    <div class="wrap">
      <Card class="lang-card">
        <template #title>
          <div class="card-title">{{ t('settings.selectLanguage') }}</div>
        </template>
        <template #content>
          <div class="lang">
            <Button
              :label="t('settings.spanish')"
              :severity="locale === 'es' ? 'warning' : 'secondary'"
              @click="applyLanguage('es')"
            />
            <Button
              :label="t('settings.english')"
              :severity="locale === 'en' ? 'warning' : 'secondary'"
              @click="applyLanguage('en')"
            />
          </div>
          <small class="hint">{{ t('settings.appliesImmediately') }}</small>
        </template>
      </Card>
    </div>
  </AppLayout>
</template>

<style scoped>
.wrap { max-width: 480px; margin: 0 auto; padding-top: 14px; }
.lang-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(0,0,0,.06);
  color: #111;
}
.card-title { font-weight: 800; color: #111; }
.lang { display: flex; gap: 12px; }
.hint { display: block; margin-top: 10px; color: #6b7280; }
</style>
