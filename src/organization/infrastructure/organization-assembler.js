import { Organization } from '../domain/organization.entity.js';

export class OrganizationAssembler {
    toOrganization(dto) {
        const data = dto?.data || dto;
        const members = Array.isArray(data?.memberIds) ? data.memberIds : [];

        return new Organization({
            id: data?.id || data?._id || null,
            name: data?.name || '',
            description: data?.description || '',
            status: data?.status || 'active',
            members,
            createdAt: data?.createdAt || data?.created_at || new Date().toISOString(),
            location: data?.location || ''
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
            status: formData.status || 'active',
            agronomistId: formData.agronomistId || null
        };
    }
}
