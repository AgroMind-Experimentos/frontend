import axios from 'axios';
import { OrganizationAssembler } from './organization-assembler.js';
import { userStore } from '../../iam/application/user.store.js';

export class OrganizationApi {
    baseUrl = import.meta.env.VITE_API_BASE_URL;
    organizationsEndpoint = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT;
    http = axios.create({ baseURL: this.baseUrl });

    async getAll(profileId) {
        try {
            const url = profileId
                ? `${this.organizationsEndpoint}?profileId=${profileId}`
                : this.organizationsEndpoint;
            const { data } = await this.http.get(url);
            const organizationsData = data?.data || data?.organizations || data;
            return new OrganizationAssembler().toOrganizationArray(organizationsData);
        } catch (error) {
            console.error('Error fetching organizations:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const { data } = await this.http.get(`${this.organizationsEndpoint}/${id}`);
            return new OrganizationAssembler().toOrganization(data);
        } catch (error) {
            console.error(`Error fetching organization ${id}:`, error);
            throw error;
        }
    }

    async create(organizationData) {
        try {
            const payload = {
                name: organizationData.name,
                description: organizationData.description,
                location: organizationData.location,
                agronomistId: organizationData.agronomistId || userStore.state.user?.id || null
            };
            const { data } = await this.http.post(this.organizationsEndpoint, payload);
            const entity = new OrganizationAssembler().toOrganization(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            console.error('❌ Error creating organization:', error.response?.data);
            throw error;
        }
    }

    async update(id, organizationData) {
        try {
            // El backend usa PATCH según el snippet proveído
            const { data } = await this.http.patch(`${this.organizationsEndpoint}/${id}`, organizationData);
            const entity = new OrganizationAssembler().toOrganization(data);
            if (data.message) entity.messageKey = data.message;
            return entity;
        } catch (error) {
            console.error(`Error updating organization ${id}:`, error);
            throw error;
        }
    }

    async patch(id, organizationData) {
        return this.update(id, organizationData);
    }

    async delete(id) {
        try {
            await this.http.delete(`${this.organizationsEndpoint}/${id}`);
            return true;
        } catch (error) {
            throw error;
        }
    }

    async addMember(organizationId, memberId) {
        try {
            const organization = await this.getById(organizationId);
            if (!organization.members.includes(memberId)) {
                organization.members.push(memberId);
                return await this.update(organizationId, organization);
            }
            return organization;
        } catch (error) {
            throw error;
        }
    }

    async removeMember(organizationId, memberId) {
        try {
            const organization = await this.getById(organizationId);
            organization.members = organization.members.filter(id => id !== memberId);
            return await this.update(organizationId, organization);
        } catch (error) {
            throw error;
        }
    }
}
