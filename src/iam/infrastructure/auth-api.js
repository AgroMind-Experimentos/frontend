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
            // Enviar los datos de login con POST a la URL del backend
            const { data } = await this.http.post(this.loginEndpoint, {
                email,      // email enviado en el cuerpo
                password    // password enviado en el cuerpo
            }, {
                headers: {
                    'Content-Type': 'application/json'  // Asegúrate de que el Content-Type sea application/json
                }
            });

            // Si el login es exitoso, devuelve el mensaje y los tokens
            return {
                message: data.message,  // 'Logged in' o el mensaje del backend
                tokens: data.tokens     // Tokens generados por el backend
            };
        } catch (error) {
            // Manejo de errores en el frontend
            if (error.response?.status === 401) {
                throw new Error('Invalid credentials');  // Las credenciales son incorrectas
            }
            const err = new Error('Service unavailable');  // Error de servicio
            err.response = { status: 503 };
            throw err;
        }
    }

    async register(name, email, password) {
        try {
            // Enviar los datos de registro con POST al backend
            const { data } = await this.http.post(this.registerEndpoint, {
                email,
                password,
                displayName: name
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Si el registro es exitoso, devuelve el usuario y los tokens
            return {
                user: data.user,
                tokens: data.tokens
            };
        } catch (error) {
            // Manejo de errores específicos del backend
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
