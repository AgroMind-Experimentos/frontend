<script setup lang="js">
import {ref, computed, onMounted} from 'vue'
import {useRouter, useRoute} from 'vue-router'
import AppLayout from '../../../../shared/presentation/components/app-layout.vue'
import { userStore } from '../../../../iam/application/user.store.js'

const router = useRouter()
const route = useRoute()
const activeTab = ref('kanban')

const isAgronomist = computed(() => userStore.state.user?.role === 'Agronomist')

onMounted(() => {
  const currentPath = route.path
  if (currentPath.includes('/new-task')) {
    if (!isAgronomist.value) {
      router.push('/tasks/kanban')
    } else {
      activeTab.value = 'new-task'
    }
  } else if (currentPath.includes('/kanban')) {
    activeTab.value = 'kanban'
  } else {
    router.push('/tasks/kanban')
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
          <h1>{{ $t('tasksExt.taskDashboardTitle') }}</h1>
          <p>{{ $t('tasksExt.taskDashboardDesc') }}</p>
        </div>

      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-navigation">
        <button
          :class="['tab-button', { active: activeTab === 'kanban' }]"
          @click="navigateToTab('kanban')"
        >
          <i class="pi pi-th-large"></i>
          {{ $t('tasks.kanbanBoard') }}
        </button>
        <button
            v-if="isAgronomist"
            :class="['tab-button', { active: activeTab === 'new-task' }]"
            @click="navigateToTab('new-task')"
        >
          <i class="pi pi-plus"></i>
          {{ $t('tasks.newTask') }}
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
  margin-bottom: 2rem;
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
  .tabs-navigation {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
  }
}
</style>