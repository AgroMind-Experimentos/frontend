import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import i18n from './i18n.js'
import PrimeVue from 'primevue/config'
import Lara from '@primeuix/themes/lara';
import {Button, FloatLabel, Card, Checkbox, InputText, DatePicker, Toolbar, SelectButton} from 'primevue'
import 'primeicons/primeicons.css'
import ConfirmationService from 'primevue/confirmationservice';

createApp(App)
    .use(PrimeVue, { theme: { preset: Lara, options: { darkModeSelector: false } } })
    .use(ConfirmationService)
    .component('pv-toolbar', Toolbar)
    .component('pv-button', Button)
    .component('pv-floatlabel', FloatLabel)
    .component('pv-card', Card)
    .component('pv-checkbox', Checkbox)
    .component('pv-datepicker', DatePicker)
    .component('pv-input-text', InputText)
    .component('pv-select-button', SelectButton)
    .use(router)
    .use(i18n)
    .mount('#app')

console.log("ENV:", import.meta.env);