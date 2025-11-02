<script setup lang="js">
import {ref, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import AppLayout from '../../../../shared/presentation/components/app-layout.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref('completed')

onMounted(() => {
  // Detectar la pestaña activa basada en la ruta actual
  const currentPath = route.path
  if (currentPath.includes('/completed')) {
    activeTab.value = 'completed'
  } else if (currentPath.includes('/in-progress')) {
    activeTab.value = 'in-progress'
  } else if (currentPath.includes('/pending')) {
    activeTab.value = 'pending'
  } else if (currentPath.includes('/logs')) {
    activeTab.value = 'logs'
  } else {
    router.push('/tasks/completed')
  }
})

const navigateToTab = (tab) => {
  activeTab.value = tab
  router.push(`/tasks/${tab}`)
}
</script>

<template>
  <AppLayout>
    <div class="task-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="title-section">
          <h1>Gestión de Tareas</h1>
          <p>Administra y supervisa todas tus tareas agrícolas</p>
        </div>

        <!-- Organization Card -->
        <div class="organization-section">
          <pv-card class="organization-card">
            <template #content>
              <div class="icon-and-text">
                <span class="pi pi-sitemap icon-spacer"></span>
                <div>
                  <div class="organization-name">Organización</div>
                  <div class="details">EcoTrack Farm</div>
                </div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-navigation">
        <button
          :class="['tab-button', { active: activeTab === 'completed' }]"
          @click="navigateToTab('completed')"
        >
          <i class="pi pi-check-circle"></i>
          Completadas
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'in-progress' }]"
          @click="navigateToTab('in-progress')"
        >
          <i class="pi pi-clock"></i>
          En Progreso
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'pending' }]"
          @click="navigateToTab('pending')"
        >
          <i class="pi pi-pause"></i>
          Pendientes
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'logs' }]"
          @click="navigateToTab('logs')"
        >
          <i class="pi pi-list"></i>
          Registros
        </button>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <router-view name="task-dashboard" />
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.task-dashboard {
  padding: 1rem;
}

.dashboard-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  margin-bottom: 2rem;
  align-items: start;
}

.title-section h1 {
  margin: 0 0 0.5rem 0;
  color: #2c5530;
  font-size: 2rem;
}

.title-section p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.organization-card {
  min-width: 250px;
}

.icon-and-text {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-spacer {
  font-size: 2rem;
  color: #2c5530;
}

.organization-name {
  font-weight: 600;
  color: #2c5530;
  margin-bottom: 0.25rem;
}

.details {
  color: #666;
  font-size: 0.9rem;
}


.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 1rem;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f8f9fa;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background: #e9ecef;
  color: #2c5530;
}

.tab-button.active {
  background: #2c5530;
  color: white;
}

.content-area {
  min-height: 400px;
}

@media (max-width: 768px) {
  .dashboard-header {
    grid-template-columns: 1fr;
  }

  .tabs-navigation {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
  }
}
</style>