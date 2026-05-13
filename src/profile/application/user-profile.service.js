import { reactive } from 'vue';
import { UserProfileApi } from '../infrastructure/user-profile-api.js';
import { UserProfileAssembler } from '../infrastructure/user-profile.assembler.js';

class UserProfileService {
    state = reactive({
        users: [],
        loading: false,
        error: null
    });

    #api = new UserProfileApi();
    #assembler = new UserProfileAssembler();

    async fetchFarmers() {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getFarmers();
            this.state.users = this.#assembler.toEntityList(data);
            return this.state.users;
        } catch (error) {
            this.state.error = error.message;
            return [];
        } finally {
            this.state.loading = false;
        }
    }

    async fetchAllUsers() {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getAllUsers();

            this.state.users = this.#assembler.toEntityList(data);

            return this.state.users;
        } catch (error) {
            this.state.error = error.message;
            return [];
        } finally {
            this.state.loading = false;
        }
    }

    async getUserById(id) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getUserById(id);
            return this.#assembler.toEntity(data);
        } catch (error) {
            this.state.error = error.message;
            return null;
        } finally {
            this.state.loading = false;
        }
    }
}

export const userProfileService = new UserProfileService();

