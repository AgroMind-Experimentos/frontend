import axios from 'axios';

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
            return data;
        } catch (error) {
            console.error('Error fetching organizations:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const { data } = await this.http.get(`${this.organizationsEndpoint}/${id}`);
            return data;
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
                status: organizationData.status || 'active',
                agronomistId: organizationData.agronomistId || null
            };
            const { data } = await this.http.post(this.organizationsEndpoint, payload);
            return data;
        } catch (error) {
            console.error('❌ Error creating organization:', error.response?.data);
            throw error;
        }
    }

    async update(id, organizationData) {
        try {
            const { data } = await this.http.put(`${this.organizationsEndpoint}/${id}`, organizationData);
            return data;
        } catch (error) {
            console.error(`Error updating organization ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            console.log('🗑️ DELETE organización:', id);
            await this.http.delete(`${this.organizationsEndpoint}/${id}`);
            console.log('✅ Organización eliminada exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error deleting organization:', error);
            console.error('Error details:', error.response?.data);
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
            console.error(`Error adding member to organization ${organizationId}:`, error);
            throw error;
        }
    }

    async removeMember(organizationId, memberId) {
        try {
            const organization = await this.getById(organizationId);
            organization.members = organization.members.filter(id => id !== memberId);
            return await this.update(organizationId, organization);
        } catch (error) {
            console.error(`Error removing member from organization ${organizationId}:`, error);
            throw error;
        }
    }
}
