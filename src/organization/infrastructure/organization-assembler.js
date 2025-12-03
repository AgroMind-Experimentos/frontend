import { Organization } from '../domain/organization.entity.js';

export class OrganizationAssembler {
    /**
     * Converts raw API data to Organization entity
     * @param {Object} data - Raw data from API
     * @returns {Organization}
     */
    toOrganization(data) {
        return new Organization({
            id: data.id,
            name: data.name,
            description: data.description,
            status: data.status,
            members: data.members || [],
            createdAt: data.createdAt,
            location: data.location
        });
    }

    /**
     * Converts Organization entity to API format
     * @param {Organization} organization - Organization entity
     * @returns {Object}
     */
    toApiFormat(organization) {
        return {
            id: organization.id,
            name: organization.name,
            description: organization.description,
            status: organization.status,
            members: organization.members,
            createdAt: organization.createdAt,
            location: organization.location
        };
    }

    /**
     * Converts array of raw API data to array of Organization entities
     * @param {Array} dataArray - Array of raw data from API
     * @returns {Array<Organization>}
     */
    toOrganizationArray(dataArray) {
        return dataArray.map(data => this.toOrganization(data));
    }

    /**
     * Converts create/update form data to API format
     * @param {Object} formData - Form data from UI
     * @returns {Object}
     */
    fromFormData(formData) {
        return {
            name: formData.name,
            description: formData.description,
            status: formData.status || 'active'
        };
    }
}
