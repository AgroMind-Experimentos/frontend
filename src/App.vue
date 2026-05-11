<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { userStore } from './iam/application/user.store.js';

onMounted(() => {
    userStore.restoreSession();
});
</script>

<template>
  <RouterView />
</template>
