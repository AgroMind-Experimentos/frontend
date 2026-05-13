import axios from 'axios';

export class AuthApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    loginEndpoint = import.meta.env.VITE_LOGIN_ENDPOINT;
    registerEndpoint = import.meta.env.VITE_REGISTER_ENDPOINT;
    logoutEndpoint = import.meta.env.VITE_LOGOUT_ENDPOINT;
    updatePasswordEndpoint = import.meta.env.VITE_UPDATE_PASSWORD_ENDPOINT;

    http = axios.create({
        baseURL: this.baseUrl,
        withCredentials: true
    });

    /**
     * Consume el nuevo LoginCommandService.
     * Maneja el error 401 (InvalidCredentials).
     */
    async login(email, password) {
        try {
            const { data } = await this.http.post(this.loginEndpoint, { email, password }, {
                headers: { 'Content-Type': 'application/json' }
            });

            return {
                user: {
                    id: data.userId,
                    name: data.displayName,
                    email: email,
                    displayName: data.displayName,
                    role: data.role
                },
                tokens: {
                    accessToken: data.token,
                    refreshToken: null,
                    expiresAt: data.expiresAt
                }
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Service unavailable';
            const status = error.response?.status || 503;

            const err = new Error(message);
            err.response = error.response;
            throw err;
        }
    }

    /**
     * Consume el nuevo RegisterCommandService.
     * Mapea errores 400 (InvalidInput/PasswordTooShort) y 409 (EmailAlreadyExists).
     */
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
                message: data.message,
                userId: data.userId,
                email: data.email,
                displayName: data.displayName
            };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            const status = error.response?.status || 500;

            const err = new Error(message);
            err.response = error.response;
            throw err;
        }
    }

    /**
     * Consume el nuevo LogoutCommandService.
     * La cookie 'sid' se envía automáticamente gracias a withCredentials.
     */
    async logout() {
        try {
            const { data } = await this.http.post(this.logoutEndpoint);
            return data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { message: "Session already invalidated" };
            }
            console.error('Logout failed:', error);
            throw error;
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const { data } = await this.http.post(this.updatePasswordEndpoint, {
                currentPassword,
                newPassword
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Password update failed';

            const err = new Error(message);
            err.response = error.response;

            if (error.response?.status === 401) {
                console.error('Session expired or unauthorized');
            }

            throw err;
        }
    }
}