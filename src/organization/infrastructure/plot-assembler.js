export class PlotAssembler {
    static parseDescription(description) {
        if (!description) return {};
        const data = {};
        const parts = description.split('|').map(p => p.trim());

        parts.forEach(part => {
            if (part.includes('Área:')) data.area = part.replace('Área:', '').trim();
            else if (part.includes('Ubicación:')) data.location = part.replace('Ubicación:', '').trim();
            else if (part.includes('Cultivo:')) data.crop = part.replace('Cultivo:', '').trim();
        });
        return data;
    }

    static toEntityFromResponse(response) {
        if (!response) return null;

        return {
            id: response.id,
            organizationId: response.organizationId,
            name: response.name,
            area: response.area || 0,

            crop: response.cultivation || response.crop || '',

            latitude: response.latitude !== null && response.latitude !== undefined ? Number(response.latitude) : null,
            longitude: response.longitude !== null && response.longitude !== undefined ? Number(response.longitude) : null,

            createdAt: response.createdAt,
            status: response.status || 'active',
            members: response.memberIds || response.members || []
        };
    }

    static fromFormData(formData) {
        return {
            name: formData.name ? formData.name.trim() : '',
            area: parseFloat(formData.area) || 0,
            cultivation: formData.crop ? formData.crop.trim() : '',
            organizationId: parseInt(formData.organizationId),
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null
        };
    }

    static toApiFormat(plot) {
        return {
            name: plot.name,
            organizationId: plot.organizationId
        };
    }
}