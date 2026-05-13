// ⬅️ PASA a import estático
import LoginView from './views/login-view.vue';
import RegisterView from './views/register-view.vue';

const userRoutes = [
    { path: '/login', name: 'user-login', component: LoginView },
    { path: '/register', name: 'user-register', component: RegisterView }
];

export default userRoutes;
