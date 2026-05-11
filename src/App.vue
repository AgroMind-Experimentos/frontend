<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Toast from 'primevue/toast';
import { userStore } from './iam/application/user.store.js';

onMounted(() => {
    userStore.restoreSession();
});
</script>

<template>
  <Toast position="bottom-right" />
  <RouterView />
</template>
