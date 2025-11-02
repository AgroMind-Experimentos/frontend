<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen flex align-items-center justify-content-center" style="background:#fff;">
    <div class="text-center">
      <h1 class="mb-2">{{ t('notFound.title') }}</h1>
      <p class="mb-4">{{ t('notFound.message') }}</p>
      <router-link to="/login">{{ t('notFound.backToHome') }}</router-link>
    </div>
  </div>
</template>
