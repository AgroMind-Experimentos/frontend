import sharedRoutes from "./shared/presentation/shared-views.js"
import userRoutes from "./iam/presentation/user-routes.js"
import tasksRoutes from "./monitoring-control/presentation/tasks-routes.js"
import organizationRoutes from "./organization/presentation/organization-routes.js"
import plotRoutes from "./organization/presentation/plot-routes.js"
import weatherRoutes from "./weather/presentation/weather-routes.js"
import reportRoutes from "./Report/presentation/report-routes.js"
import { createRouter, createWebHistory } from "vue-router"
import { userStore } from "./iam/application/user.store.js"

const protectedRoutes = [
    ...sharedRoutes,
    ...tasksRoutes,
    ...organizationRoutes,
    ...plotRoutes,
    ...weatherRoutes,
    ...reportRoutes
]

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/login' },
        ...userRoutes,
        ...protectedRoutes
    ]
})

// router.js
router.beforeEach(async (to) => {
    if (!userStore.state.isSessionRestored) {
        await userStore.restoreSession();
    }

    const isAuthenticated = userStore.isAuthenticated;
    const isPublicRoute = userRoutes.some(route => route.path === to.path || route.name === to.name);

    if (!isAuthenticated && !isPublicRoute) {
        return { path: '/login' };
    }

    if (isAuthenticated && isPublicRoute) {
        return { name: 'dashboard' };
    }

    if (to.name === 'organization-create') {
        const role = userStore.state.user?.role;
        if (role !== 'Agronomist') return { name: 'dashboard' };
    }
});

export default router;
