<script setup>
import { userStore } from '../../../iam/application/user.store.js';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};

// Obtener nombre del usuario o mostrar un valor por defecto
const userName = userStore.state.user?.name || 'Usuario';
</script>

<template>
  <aside class="sidebar">
    <div class="profile">
      <img class="avatar" src="https://files.catbox.moe/7kr0f6.png" alt="User" />
      <div class="welcome">{{ t('sidebar.welcome') }} {{ userName }}</div>
    </div>

    <nav class="menu">
      <router-link class="item" :to="{ name: 'dashboard' }">
        <i class="pi pi-desktop"></i><span>{{ t('sidebar.home') }}</span>
      </router-link>

      <router-link class="item" to="/tasks/completed">
        <i class="pi pi-check-square"></i><span>{{ t('sidebar.tasks') }}</span>
      </router-link>

      <router-link class="item" :to="{ name: 'weather' }">
        <i class="pi pi-sun"></i><span>{{ t('sidebar.weather') }}</span>
      </router-link>

      <router-link class="item" :to="{ name: 'reports' }">
        <i class="pi pi-chart-line"></i><span>{{ t('sidebar.reports') }}</span>
      </router-link>

      <router-link class="item" :to="{ name: 'user-profile' }">
        <i class="pi pi-user"></i><span>{{ t('sidebar.profile') }}</span>
      </router-link>

      <router-link class="item" :to="{ name: 'settings' }">
        <i class="pi pi-cog"></i><span>{{ t('sidebar.settings') }}</span>
      </router-link>
    </nav>

    <div class="logout">
      <button class="item logout-btn" @click="handleLogout">
        <i class="pi pi-power-off"></i><span>{{ t('sidebar.logout') }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar{
  width:260px;background:#1d6b31;color:#fff;min-height:100vh;
  display:flex;flex-direction:column;padding:18px 16px 24px
}
.profile{display:flex;flex-direction:column;align-items:center;gap:.75rem;margin-top:.5rem}
.avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid #2f8b4a;background:#2f8b4a}
.welcome{font-weight:700;text-align:center}
.menu{display:flex;flex-direction:column;margin-top:12px;gap:6px}
.item{
  display:flex;align-items:center;gap:.8rem;padding:1rem;border-radius:12px;
  color:#ffffff;text-decoration:none;font-weight:700;opacity:.95;
  background:none;border:none;cursor:pointer;width:100%;text-align:left
}
.item:hover{background:#185a29}
.item.router-link-active{background:#2a7c3e}
.logout{margin-top:auto}
.logout-btn{
  font-family:inherit;
  font-size:inherit;
}
</style>
