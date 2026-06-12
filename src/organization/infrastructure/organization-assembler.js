import {Organization} from "../domain/organization.entity.js";

export class OrganizationAssembler {
    toOrganization(dto) {
        const data = dto?.data || dto;
        const members = Array.isArray(data?.memberIds) ? data.memberIds : [];

        return new Organization({
            id: data?.id || data?._id || null,
            name: data?.name || '',
            description: data?.description || '',

            coordinates: data?.coordinates ? {
                latitude: data.coordinates.latitude,
                longitude: data.coordinates.longitude
            } : null,

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

            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            agronomistId: formData.agronomistId || null
        };
    }
}