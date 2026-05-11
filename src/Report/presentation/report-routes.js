const reportList = () => import('./report-list.vue');

const reportRoutes = [
    {
        path: '/reports',
        name: 'reports',
        component: reportList
    }
];

export default reportRoutes;
