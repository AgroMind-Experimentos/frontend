import { reactive } from 'vue';
import { OrganizationApi } from '../infrastructure/organization-api.js';
import { OrganizationAssembler } from '../infrastructure/organization-assembler.js';
import { userStore } from '../../iam/application/user.store.js';

class OrganizationService {
    state = reactive({
        organizations: [],
        currentOrganization: null,
        loading: false,
        error: null
    });

    #api = new OrganizationApi();
    #assembler = new OrganizationAssembler();

    /**
     * Get all organizations
     * @returns {Promise<Array<Organization>>}
     */
    async getAllOrganizations() {
        this.state.loading = true;
        this.state.error = null;

        try {
            const profileId = userStore.state.user?.id;
            this.state.organizations = await this.#api.getAll(profileId);
            return this.state.organizations;
        } catch (error) {
            this.state.error = 'Error al cargar las organizaciones';
            console.error('[OrganizationService] Error fetching organizations:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Get organization by ID
     * @param {string} id - Organization ID
     * @returns {Promise<Organization>}
     */
    async getOrganizationById(id) {
        this.state.loading = true;
        this.state.error = null;

        try {
            this.state.currentOrganization = await this.#api.getById(id);
            return this.state.currentOrganization;
        } catch (error) {
            this.state.error = 'Error al cargar la organización';
            console.error('Error fetching organization:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Create new organization
     * @param {Object} organizationData - Organization form data
     * @returns {Promise<Organization>}
     */
    async createOrganization(organizationData) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const apiData = this.#assembler.fromFormData(organizationData);
            const newOrganization = await this.#api.create(apiData);
            this.state.organizations.push(newOrganization);
            return newOrganization;
        } catch (error) {
            this.state.error = 'Error al crear la organización';
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Patch organization (partial update)
     * @param {string} id - Organization ID
     * @param {{ name: string, description: string, status: string, memberIds: number[] }} patchData
     * @returns {Promise<Organization>}
     */
    async patchOrganization(id, patchData) {
        this.state.loading = true;
        this.state.error = null;
        try {
            const updatedOrg = await this.#api.patch(id, patchData);
            const index = this.state.organizations.findIndex(o => o.id === id);
            if (index !== -1) this.state.organizations[index] = updatedOrg;
            if (this.state.currentOrganization?.id === id) this.state.currentOrganization = updatedOrg;
            return updatedOrg;
        } catch (error) {
            this.state.error = 'Error al actualizar la organización';
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Update organization
     * @param {string} id - Organization ID
     * @param {Object} organizationData - Updated organization data
     * @returns {Promise<Organization>}
     */
    async updateOrganization(id, organizationData) {
        this.state.loading = true;
        this.state.error = null;

        try {
            const apiData = this.#assembler.fromFormData(organizationData);
            const updatedOrganization = await this.#api.update(id, apiData);

            // Update in local state
            const index = this.state.organizations.findIndex(org => org.id === id);
            if (index !== -1) {
                this.state.organizations[index] = updatedOrganization;
            }

            if (this.state.currentOrganization?.id === id) {
                this.state.currentOrganization = updatedOrganization;
            }

            return updatedOrganization;
        } catch (error) {
            this.state.error = 'Error al actualizar la organización';
            console.error('Error updating organization:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Delete organization
     * @param {string} id - Organization ID
     * @returns {Promise<boolean>}
     */
    async deleteOrganization(id) {
        this.state.loading = true;
        this.state.error = null;

        try {
            await this.#api.delete(id);

            // Remove from local state
            this.state.organizations = this.state.organizations.filter(org => org.id !== id);

            if (this.state.currentOrganization?.id === id) {
                this.state.currentOrganization = null;
            }

            return true;
        } catch (error) {
            this.state.error = 'Error al eliminar la organización';
            console.error('Error deleting organization:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Add member to organization
     * @param {string} organizationId - Organization ID
     * @param {string} memberId - Member ID
     * @returns {Promise<Organization>}
     */
    async addMember(organizationId, memberId) {
        this.state.loading = true;
        this.state.error = null;

        try {
            const updatedOrganization = await this.#api.addMember(organizationId, memberId);

            // Update in local state
            const index = this.state.organizations.findIndex(org => org.id === organizationId);
            if (index !== -1) {
                this.state.organizations[index] = updatedOrganization;
            }

            if (this.state.currentOrganization?.id === organizationId) {
                this.state.currentOrganization = updatedOrganization;
            }

            return updatedOrganization;
        } catch (error) {
            this.state.error = 'Error al agregar miembro';
            console.error('Error adding member:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Remove member from organization
     * @param {string} organizationId - Organization ID
     * @param {string} memberId - Member ID
     * @returns {Promise<Organization>}
     */
    async removeMember(organizationId, memberId) {
        this.state.loading = true;
        this.state.error = null;

        try {
            const updatedOrganization = await this.#api.removeMember(organizationId, memberId);

            // Update in local state
            const index = this.state.organizations.findIndex(org => org.id === organizationId);
            if (index !== -1) {
                this.state.organizations[index] = updatedOrganization;
            }

            if (this.state.currentOrganization?.id === organizationId) {
                this.state.currentOrganization = updatedOrganization;
            }

            return updatedOrganization;
        } catch (error) {
            this.state.error = 'Error al remover miembro';
            console.error('Error removing member:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * Clear current organization
     */
    clearCurrentOrganization() {
        this.state.currentOrganization = null;
    }

    /**
     * Clear error state
     */
    clearError() {
        this.state.error = null;
    }
}

// Export singleton instance
export const organizationService = new OrganizationService();
