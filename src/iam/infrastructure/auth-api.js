import axios from 'axios';

export class AuthApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    loginEndpoint = import.meta.env.VITE_LOGIN_ENDPOINT;
    registerEndpoint = import.meta.env.VITE_REGISTER_ENDPOINT;
    logoutEndpoint = import.meta.env.VITE_LOGOUT_ENDPOINT;
    http = axios.create({
        baseURL: this.baseUrl,
    });

    async login(email, password) {
        try {
            const { data } = await this.http.post(this.loginEndpoint, { email, password }, {
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                user: {
                    id: data.userId,
                    name: data.displayName || email.split('@')[0],
                    email: email,
                    displayName: data.displayName || email.split('@')[0],
                    role: data.role
                },
                tokens: { accessToken: data.token, refreshToken: null }
            };
        } catch (error) {
            if (error.response?.status === 401) {
                const err = new Error('Invalid credentials');
                err.response = { status: 401 };
                throw err;
            }
            const err = new Error('Service unavailable');
            err.response = { status: 503 };
            throw err;
        }
    }

    async register(name, email, password, role) {
        try {
            const { data } = await this.http.post(this.registerEndpoint, {
                email,
                password,
                displayName: name,
                role: role
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                userId: data.userId,
                email: data.email,
                displayName: data.displayName
            };
        } catch (error) {
            if (error.response?.status === 409) {
                const err = new Error('Email already exists');
                err.response = { status: 409 };
                throw err;
            }
            if (error.response?.status === 400) {
                const err = new Error('Invalid registration data');
                err.response = { status: 400 };
                throw err;
            }
            const err = new Error('Registration failed');
            err.response = { status: 500 };
            throw err;
        }
    }

    async logout() {
        try {
            const { data } = await this.http.post(this.logoutEndpoint);
            return data;
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }


}
