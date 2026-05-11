
<script setup>
import InvitationBell from './invitation-bell.vue';
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <div class="logo">
        <img src="/icon.ico" alt="EcoTrack" />
      </div>
      <h3 class="title">{{ $t('sharedExt.ecotrack') }}</h3>
    </div>

    <div class="right">
      <InvitationBell />
    </div>
  </header>
</template>

<style scoped>
.topbar{
  height:64px;background:#fff;border-radius:14px;margin:14px 16px 0 16px;
  display:flex;align-items:center;justify-content:space-between;padding:0 16px;
  box-shadow:0 4px 14px rgba(0,0,0,.06)
}
.brand{display:flex;align-items:center;gap:.75rem}
.logo{width:36px;height:36px;border-radius:50%;overflow:hidden;background:#2b7a3f;display:grid;place-items:center}
.logo img{width:100%;height:100%;object-fit:cover}
.title{margin:0;color:#111}
.right{display:flex;align-items:center;gap:12px}
.user-info{display:flex;align-items:center;gap:8px}
.user-name{color:#2c5530;font-weight:600;font-size:0.9rem}
</style>
