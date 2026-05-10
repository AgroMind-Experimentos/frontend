import { reactive } from 'vue';
import { AuthApi } from '../infrastructure/auth-api.js';
import { AuthAssembler } from '../infrastructure/auth.assembler.js';

class UserStore {
    state = reactive({
        loading: false,
        errorKey: null,     // i18n key (p.e. 'auth.invalidCredentials')
        user: this.#loadFromStorage('user'),
        tokens: this.#loadFromStorage('tokens')
    });

    #api = new AuthApi();
    #assembler = new AuthAssembler();

    #loadFromStorage(key) {
        try {
            const item = localStorage.getItem(`ecotrack_${key}`);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    #saveToStorage(key, value) {
        try {
            if (value) {
                localStorage.setItem(`ecotrack_${key}`, JSON.stringify(value));
            } else {
                localStorage.removeItem(`ecotrack_${key}`);
            }
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    }

    async login({ email, password }) {
        this.state.loading = true;
        this.state.errorKey = null;
        try {
            const data = await this.#api.login(email, password);
            this.state.user = this.#assembler.toUser(data.user);
            this.state.tokens = this.#assembler.toTokens(data.tokens);

            // Guardar en localStorage
            this.#saveToStorage('user', this.state.user);
            this.#saveToStorage('tokens', this.state.tokens);

            return true;
        } catch (err) {
            const msg = err?.response?.data?.message;
            this.state.errorKey = msg ? `auth.${msg}` : 'common.unexpectedError';
            return false;
        } finally {
            this.state.loading = false;
        }
    }

    async register({ name, email, password, role }) {
        this.state.loading = true;
        this.state.errorKey = null;
        try {
            await this.#api.register(name, email, password, role);
            return true;
        } catch (err) {
            const msg = err?.response?.data?.message;
            this.state.errorKey = msg ? `auth.${msg}` : 'common.unexpectedError';
            return false;
        } finally {
            this.state.loading = false;
        }
    }

    async logout() {
        try {
            await this.#api.logout();
        } catch (err) {
            const msg = err?.response?.data?.message;
            if (msg) this.state.errorKey = `auth.${msg}`;
        } finally {
            this.state.user = null;
            this.state.tokens = null;
            // Limpiar localStorage
            this.#saveToStorage('user', null);
            this.#saveToStorage('tokens', null);
        }
    }
}

export const userStore = new UserStore();
