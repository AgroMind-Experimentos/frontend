import PlotCreateView from './views/plot-create-view.vue';
import PlotEditView from './views/plot-edit-view.vue';

const plotRoutes = [
    {
        path: '/plots/create',
        name: 'plot-create',
        component: PlotCreateView
    },
    {
        path: '/plots/:id/edit',
        name: 'plot-edit',
        component: PlotEditView,
        props: true
    }
];

export default plotRoutes;