import {createRouter, createWebHistory} from "vue-router"
import userRoutes from "./iam/presentation/user-routes.js"
import tasksRoutes from "./monitoring-control/presentation/tasks-routes.js"
import organizationRoutes from "./organization/presentation/organization-routes.js"
import parcelRoutes from "./organization/presentation/parcel-routes.js"
import weatherRoutes from "./weather/presentation/weather-routes.js"
import reportRoutes from "./Report/report-routes.js"
import DashboardView from "./shared/presentation/views/dashboard-view.vue"
import SettingsView from "./shared/presentation/views/settings-view.vue"
import ProfileView from "./shared/presentation/views/profile-view.vue"
import { userStore } from "./iam/application/user.store.js"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },

        { path: '/dashboard', name: 'dashboard', component: DashboardView },
        { path: '/settings', name: 'settings', component: SettingsView },
        { path: '/profile', name: 'user-profile', component: ProfileView },
        ...userRoutes,
        ...tasksRoutes,
        ...organizationRoutes,
        ...parcelRoutes,
        ...weatherRoutes,
        ...reportRoutes
    ]
})

router.beforeEach((to) => {
    const role = userStore.state.user?.role
    const agronomistOnly = ['organization-create', 'reports']
    if (agronomistOnly.includes(to.name) && role !== 'Agronomist')
        return { name: 'dashboard' }
})

export default router
