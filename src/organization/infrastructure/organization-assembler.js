import { Organization } from '../domain/organization.entity.js';

export class OrganizationAssembler {
    toOrganization(dto) {
        const data = dto?.data || dto;
        const members = Array.isArray(data?.memberIds) ? data.memberIds : [];
        return new Organization({
            id: data?.id || data?._id || null,
            name: data?.name || '',
            description: data?.description || '',
            location: data?.location || '',
            members,
            agronomistId: data?.agronomistId || data?.agronomistOwnerId || null,
            createdAt: data?.createdAt || data?.created_at || new Date().toISOString()
        });
    }

    toOrganizationArray(dtoList) {
        if (!Array.isArray(dtoList)) return [];
        return dtoList.map(dto => this.toOrganization(dto));
    }

    fromFormData(formData) {
        return {
            name: formData.name,
            description: formData.description || '',
            location: formData.location,
            agronomistId: formData.agronomistId || null
        };
    }
}
