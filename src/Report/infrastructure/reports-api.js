import axios from 'axios'

export class ReportsApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    reportsEndpoint = import.meta.env.VITE_REPORTS_ENDPOINT;

    async getReports() {
        const endpoint = `${this.baseUrl}${this.reportsEndpoint}`;
        const response = await axios.get(endpoint);
        return response.data;
    }

    async downloadPDF() {
        const endpoint = `${this.baseUrl}${this.reportsEndpoint}/pdf`;
        const response = await axios.get(endpoint, {
            responseType: 'blob'
        });
        return response.data;
    }
}

