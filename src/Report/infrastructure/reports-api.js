import axios from 'axios'

export class ReportsApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    reportsEndpoint = import.meta.env.VITE_REPORTS_ENDPOINT;

    async getReports(organizationId) {
        const endpoint = `${this.baseUrl}${this.reportsEndpoint}`;
        const params = organizationId != null ? { organizationId } : {};
        const response = await axios.get(endpoint, { params });
        return response.data;
    }

    async downloadPDF(organizationId) {
        const endpoint = `${this.baseUrl}${this.reportsEndpoint}/pdf`;
        const params = organizationId != null ? { organizationId } : {};
        const response = await axios.get(endpoint, { responseType: 'blob', params });
        return response.data;
    }
}

