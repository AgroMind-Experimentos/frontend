import axios from 'axios';

export class UserProfileApi {
    #profilesEndpoint = import.meta.env.VITE_PROFILES_ENDPOINT;
    http = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
    });

    async getFarmers() {
        try {
            const response = await this.http.get(`${this.#profilesEndpoint}?role=Farmer`);
            return response.data?.data || response.data?.users || response.data;
        } catch (error) {
            console.error('❌ Error fetching farmers:', error);
            throw new Error('Failed to fetch farmers');
        }
    }

    async getAllUsers() {
        try {
            const response = await this.http.get(this.#profilesEndpoint);
            const users = response.data?.data || response.data?.users || response.data;
            return users;
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id) {
        try {
            const { data } = await this.http.get(`${this.#profilesEndpoint}/${id}`);
            return data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw new Error('Failed to fetch user');
        }
    }

    async getMe() {
        try {
            const { data } = await this.http.get(`${this.#profilesEndpoint}/me`);
            return data;
        } catch (error) {
            console.error('Error fetching current profile:', error);
            throw new Error('Failed to fetch profile');
        }
    }

    async updateMe(payload) {
        try {
            const { data } = await this.http.put(`${this.#profilesEndpoint}/me`, payload);
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error('Failed to update profile');
        }
    }
}

