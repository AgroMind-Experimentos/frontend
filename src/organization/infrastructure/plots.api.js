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
            const { data } = await this.http.get(this.cropsEndpoint);
            return data.map(plot => PlotAssembler.toEntityFromResponse(plot));
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            const { data } = await this.http.get(`${this.cropsEndpoint}/${id}`);
            return PlotAssembler.toEntityFromResponse(data);
        } catch (error) {
            throw error;
        }
    }

    async getByOrganizationId(organizationId) {
        try {
            const { data } = await this.http.get(`${this.cropsEndpoint}/organization/${organizationId}`);
            return data.map(plot => PlotAssembler.toEntityFromResponse(plot));
        } catch (error) {
            throw error;
        }
    }

    async create(plotData) {
        try {
            const payload = PlotAssembler.fromFormData(plotData);
            const { data } = await this.http.post(this.cropsEndpoint, payload);
            const entity = PlotAssembler.toEntityFromResponse(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            throw error;
        }
    }

    async update(id, plotData) {
        try {
            const payload = PlotAssembler.fromFormData(plotData);
            const { data } = await this.http.patch(`${this.cropsEndpoint}/${id}`, payload);
            const entity = PlotAssembler.toEntityFromResponse(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            await this.http.delete(`${this.cropsEndpoint}/${id}`);
            return true;
        } catch (error) {
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
            throw error;
        }
    }
}

