import OrganizationListView from './views/organization-list-view.vue';
import OrganizationCreateView from './views/organization-create-view.vue';
import OrganizationDetailView from './views/organization-detail-view.vue';

const organizationRoutes = [
    {
        path: '/organizations',
        name: 'organization-list',
        component: OrganizationListView
    },
    {
        path: '/organizations/create',
        name: 'organization-create',
        component: OrganizationCreateView
    },
    {
        path: '/organizations/:id',
        name: 'organization-detail',
        component: OrganizationDetailView,
        props: true
    }
];

export default organizationRoutes;
