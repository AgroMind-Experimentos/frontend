import axios from 'axios';
import { PlotAssembler } from './plot-assembler.js';

export class PlotsApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    cropsEndpoint = import.meta.env.VITE_CROPS_ENDPOINT;
    http = axios.create({
        baseURL: this.baseUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    async getAll() {
        try {
            console.log('📥 GET todas las parcelas/crops desde:', `${this.baseUrl}${this.cropsEndpoint}`);
            const { data } = await this.http.get(this.cropsEndpoint);
            console.log('✅ Parcelas recibidas del backend:', data.length, 'parcelas');
            return data.map(plot => PlotAssembler.toEntityFromResponse(plot));
        } catch (error) {
            console.error('❌ Error fetching plots:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            console.log('📥 GET plota por ID:', id);
            const { data } = await this.http.get(`${this.cropsEndpoint}/${id}`);
            console.log('✅ Plota recibida:', data);
            return PlotAssembler.toEntityFromResponse(data);
        } catch (error) {
            console.error(`❌ Error fetching plot ${id}:`, error);
            throw error;
        }
    }

    async getByOrganizationId(organizationId) {
        try {
            console.log('📥 GET parcelas por organizationId:', organizationId);
            const { data } = await this.http.get(`${this.cropsEndpoint}/organization/${organizationId}`);
            console.log('✅ Parcelas de la organización recibidas:', data.length, 'parcelas');
            return data.map(plot => PlotAssembler.toEntityFromResponse(plot));
        } catch (error) {
            console.error(`❌ Error fetching plots for organization ${organizationId}:`, error);
            throw error;
        }
    }

    async create(plotData) {
        try {
            const payload = PlotAssembler.fromFormData(plotData);
            console.log('📤 POST crear plota/crop:', payload);
            const { data } = await this.http.post(this.cropsEndpoint, payload);
            console.log('✅ Plota creada:', data);
            const entity = PlotAssembler.toEntityFromResponse(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            console.error('Error creating plot:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }

    async update(id, plotData) {
        try {
            const payload = PlotAssembler.fromFormData(plotData);
            console.log('📤 PATCH actualizar plota/crop:', payload);
            const { data } = await this.http.patch(`${this.cropsEndpoint}/${id}`, payload);
            console.log('✅ Plota actualizada:', data);
            const entity = PlotAssembler.toEntityFromResponse(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            console.error(`Error updating plot ${id}:`, error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🗑️ DELETE plota/crop:', id);
            await this.http.delete(`${this.cropsEndpoint}/${id}`);
            console.log('✅ Plota eliminada exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error deleting plot:', error);
            console.error('Error details:', error.response?.data);
            throw error;
        }
    }

    async addMember(plotId, memberId) {
        try {
            const plot = await this.getById(plotId);
            if (!plot.members) plot.members = [];

            if (!plot.members.includes(memberId)) {
                plot.members.push(memberId);
                return await this.update(plotId, plot);
            }
            return plot;
        } catch (error) {
            console.error(`Error adding member to plot ${plotId}:`, error);
            throw error;
        }
    }

    async removeMember(plotId, memberId) {
        try {
            const plot = await this.getById(plotId);
            if (plot.members) {
                plot.members = plot.members.filter(id => id !== memberId);
                return await this.update(plotId, plot);
            }
            return plot;
        } catch (error) {
            console.error(`Error removing member from plot ${plotId}:`, error);
            throw error;
        }
    }
}

