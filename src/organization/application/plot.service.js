import { reactive } from 'vue';
import { PlotsApi } from '../infrastructure/plots.api.js';

class PlotService {
    #api;

    constructor() {
        this.#api = new PlotsApi();
        this.state = reactive({
            plots: [],
            currentPlot: null,
            loading: false,
            error: null
        });
    }

    /**
     * Obtiene todas las parcelas
     */
    async getAllPlots() {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getAll();
            this.state.plots = data; // La API ya retorna entidades convertidas
            return data;
        } catch (error) {
            this.state.error = error.message || 'Error al cargar las parcelas';
            console.error('Error fetching all plots:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Obtiene las parcelas de una organización
     */
    async getPlotsByOrganizationId(organizationId) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getByOrganizationId(organizationId);
            this.state.plots = data; // La API ya retorna entidades convertidas
            return data;
        } catch (error) {
            this.state.error = error.message || 'Error al cargar las parcelas';
            console.error('Error fetching plots by organization:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Obtiene una parcela por ID
     */
    async getPlotById(id) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const data = await this.#api.getById(id);
            this.state.currentPlot = data; // La API ya retorna entidad convertida
            return data;
        } catch (error) {
            this.state.error = error.message || 'Error al cargar la parcela';
            console.error(`Error fetching plot ${id}:`, error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Crea una nueva parcela
     */
    async createPlot(plotData) {
        this.state.loading = true;
        this.state.error = null;
        try {
            // La API se encarga de convertir usando PlotAssembler.fromFormData
            const newPlot = await this.#api.create(plotData);
            this.state.plots.push(newPlot);
            return newPlot;
        } catch (error) {
            this.state.error = error.message || 'Error al crear la parcela';
            console.error('Error creating plot:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Actualiza una parcela existente
     */
    async updatePlot(id, plotData) {
        this.state.loading = true;
        this.state.error = null;
        try {
            // La API se encarga de convertir usando PlotAssembler.fromFormData
            const updatedPlot = await this.#api.update(id, plotData);

            // Actualizar en el array de plots
            const index = this.state.plots.findIndex(p => p.id === id);
            if (index !== -1) {
                this.state.plots[index] = updatedPlot;
            }

            // Actualizar currentPlot si es el mismo
            if (this.state.currentPlot?.id === id) {
                this.state.currentPlot = updatedPlot;
            }

            return updatedPlot;
        } catch (error) {
            this.state.error = error.message || 'Error al actualizar la parcela';
            console.error(`Error updating plot ${id}:`, error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Elimina una parcela
     */
    async deletePlot(id) {
        this.state.loading = true;
        this.state.error = null;
        try {
            await this.#api.delete(id);

            // Remover del array
            this.state.plots = this.state.plots.filter(p => p.id !== id);

            // Limpiar currentPlot si es el mismo
            if (this.state.currentPlot?.id === id) {
                this.state.currentPlot = null;
            }

            return true;
        } catch (error) {
            this.state.error = error.message || 'Error al eliminar la parcela';
            console.error(`Error deleting plot ${id}:`, error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Agrega un miembro a una parcela
     */
    async addMemberToPlot(plotId, memberId) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const updatedPlot = await this.#api.addMember(plotId, memberId);

            // Actualizar en el array
            const index = this.state.plots.findIndex(p => p.id === plotId);
            if (index !== -1) {
                this.state.plots[index] = updatedPlot;
            }

            return updatedPlot;
        } catch (error) {
            this.state.error = error.message || 'Error al agregar miembro';
            console.error(`Error adding member to plot ${plotId}:`, error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Remueve un miembro de una parcela
     */
    async removeMemberFromPlot(plotId, memberId) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const updatedPlot = await this.#api.removeMember(plotId, memberId);

            // Actualizar en el array
            const index = this.state.plots.findIndex(p => p.id === plotId);
            if (index !== -1) {
                this.state.plots[index] = updatedPlot;
            }

            return updatedPlot;
        } catch (error) {
            this.state.error = error.message || 'Error al remover miembro';
            console.error(`Error removing member from plot ${plotId}:`, error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Limpia el estado actual
     */
    clearCurrentPlot() {
        this.state.currentPlot = null;
    }

    /**
     * Limpia el error
     */
    clearError() {
        this.state.error = null;
    }
}

// Exportar una instancia singleton
export const plotService = new PlotService();

