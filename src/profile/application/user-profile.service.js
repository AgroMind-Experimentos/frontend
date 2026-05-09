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
        console.log('🚀 [UserProfileService] Iniciando fetchAllUsers...');
        this.state.loading = true;
        this.state.error = null;
        try {
            console.log('📡 [UserProfileService] Llamando al API...');
            const data = await this.#api.getAllUsers();
            console.log('📦 [UserProfileService] Data recibida del API:', data);

            console.log('🔄 [UserProfileService] Transformando con assembler...');
            this.state.users = this.#assembler.toEntityList(data);
            console.log('✅ [UserProfileService] Usuarios en el state:', this.state.users);
            console.log('📊 [UserProfileService] Total usuarios:', this.state.users.length);

            return this.state.users;
        } catch (error) {
            this.state.error = error.message;
            console.error('❌ [UserProfileService] Error in fetchAllUsers:', error);
            console.error('❌ [UserProfileService] Error stack:', error.stack);
            return [];
        } finally {
            this.state.loading = false;
            console.log('🏁 [UserProfileService] fetchAllUsers finalizado. Loading:', this.state.loading);
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
            console.error('Error in getUserById:', error);
            return null;
        } finally {
            this.state.loading = false;
        }
    }
}

export const userProfileService = new UserProfileService();

