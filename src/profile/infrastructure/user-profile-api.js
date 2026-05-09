import axios from 'axios';

export class UserProfileApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    http = axios.create({
        baseURL: this.baseUrl,
    });

    async getFarmers() {
        try {
            const response = await this.http.get('/users?role=Farmer');
            return response.data?.data || response.data?.users || response.data;
        } catch (error) {
            console.error('❌ Error fetching farmers:', error);
            throw new Error('Failed to fetch farmers');
        }
    }

    async getAllUsers() {
        try {
            console.log('🔍 Llamando al endpoint:', `${this.baseUrl}/users`);
            const response = await this.http.get('/users');
            console.log('📦 Respuesta completa del backend:', response);
            console.log('📊 Data recibida:', response.data);
            console.log('📝 Tipo de data:', Array.isArray(response.data) ? 'Array' : typeof response.data);

            // El backend real puede devolver los datos en diferentes formatos:
            // Opción 1: { data: [...users] }
            // Opción 2: { users: [...users] }
            // Opción 3: [...users] (directamente)
            const users = response.data?.data || response.data?.users || response.data;
            console.log('👥 Usuarios procesados:', users);

            return users;
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            console.error('❌ Error response:', error.response);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id) {
        try {
            const { data } = await this.http.get(`/users/${id}`);
            return data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw new Error('Failed to fetch user');
        }
    }
}

