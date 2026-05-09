import { ReportsApi } from '../infrastructure/reports-api.js'

export class ReportsService {
    constructor() {
        this.reportsApi = new ReportsApi()
    }

    async getReports(organizationId) {
        return this.reportsApi.getReports(organizationId)
    }

    async downloadPDF(organizationId) {
        const blob = await this.reportsApi.downloadPDF(organizationId)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }
}

