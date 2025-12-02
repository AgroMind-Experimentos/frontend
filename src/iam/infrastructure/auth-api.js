import axios from 'axios';

export class AuthApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    usersEndpoint = import.meta.env.VITE_USERS_ENDPOINT;
    loginEndpoint = import.meta.env.VITE_LOGIN_ENDPOINT;
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
            // Verificar si el email ya existe
            const { data: users } = await this.http.get(this.usersEndpoint);
            const existingUser = users.find(u => u.email === email);

            if (existingUser) {
                const err = new Error('Email already exists');
                err.response = { status: 409 };
                throw err;
            }

            // Crear nuevo usuario
            const newUser = {
                id: String(Date.now()), // ID simple basado en timestamp
                DisplayName: name,
                email,
                password
            };

            const { data: createdUser } = await this.http.post(this.usersEndpoint, newUser);

            return {
                user: { id: createdUser.id, name: createdUser.name, email: createdUser.email },
                tokens: {
                    accessToken: `jwt-token-${createdUser.id}`,
                    refreshToken: `refresh-token-${createdUser.id}`
                }
            };
        } catch (error) {
            if (error.response?.status === 409) {
                throw error;
            }
            const err = new Error('Registration failed');
            err.response = { status: 500 };
            throw err;
        }
    }


}
