import { reactive } from 'vue';
import { AuthApi } from '../infrastructure/auth-api.js';
import { AuthAssembler } from '../infrastructure/auth.assembler.js';
import { UserProfileApi } from '../../profile/infrastructure/user-profile-api.js';
import { User } from '../domain/model/user.entity.js';

class UserStore {
    state = reactive({
        loading: false,
        errorKey: null,
        successKey: null,
        user: null,
        isSessionRestored: false,
    });

    #api = new AuthApi();
    #assembler = new AuthAssembler();
    #profileApi = new UserProfileApi();

    get isAuthenticated() {
        return !!this.state.user;
    }

    async restoreSession() {
        if (this.state.isSessionRestored) return;

        try {
            const profile = await this.#profileApi.getMe();
            if (profile) {
                this.state.user = new User({
                    id: profile.id ?? profile.userId ?? null,
                    name: profile.displayName || profile.name || '',
                    email: profile.email || '',
                    role: profile.role || ''
                });
            }
        } catch {
            this.state.user = null;
        } finally {
            this.state.isSessionRestored = true;
        }
    }

    async login({ email, password }) {
        this.state.loading = true;
        this.state.errorKey = null;
        try {
            const data = await this.#api.login(email, password);
            this.state.user = this.#assembler.toUser(data.user);
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
        this.state.successKey = null;
        try {
            await this.#api.register(name, email, password, role);
            this.state.successKey = 'iam.registerSuccess';
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
        }
    }
}

export const userStore = new UserStore();
