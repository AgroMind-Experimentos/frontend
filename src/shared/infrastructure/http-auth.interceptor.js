import { getStoredToken } from './auth-token.js';

export function attachAuthToken(axiosInstance) {
    axiosInstance.interceptors.request.use((config) => {
        const token = getStoredToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
    return axiosInstance;
}
