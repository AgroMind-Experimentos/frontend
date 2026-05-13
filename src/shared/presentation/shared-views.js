const DashboardView = () => import('./views/dashboard-view.vue');
const SettingsView = () => import('./views/settings-view.vue');
const ProfileView = () => import('./views/profile-view.vue');
const HomeView = () => import('./views/home.vue');
const PageNotFoundView = () => import('./views/page-not-found.vue');

const sharedRoutes = [
    {
        path: '/home',
        name: 'home',
        component: HomeView
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView
    },
    {
        path: '/profile',
        name: 'user-profile',
        component: ProfileView
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: PageNotFoundView
    }
];

export default sharedRoutes;