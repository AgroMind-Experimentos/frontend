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
        const parsedData = this.parseDescription(response.description);

        return new Plot({
            id: response.id,
            organizationId: response.organizationId,
            name: response.name,
            description: response.description,
            area: response.area ?? parsedData.area ?? '',
            crop: response.cultivation || response.crop || parsedData.crop || '',

            coordinates: response.coordinates ? {
                latitude: response.coordinates.latitude,
                longitude: response.coordinates.longitude
            } : null,

            createdAt: response.createdAt,
            status: response.status || 'active',
            members: response.memberIds || response.members || []
        });
    }

    static fromFormData(formData) {
        const descriptionParts = [];
        if (formData.area) descriptionParts.push(`Área: ${String(formData.area).trim()}`);
        if (formData.crop) descriptionParts.push(`Cultivo: ${formData.crop.trim()}`);
        const description = descriptionParts.join(' | ');

        return {
            name: formData.name,
            area: parseFloat(formData.area) || 0,
            cultivation: formData.crop || '',
            organizationId: parseInt(formData.organizationId),
            description: description,

            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null
        };
    }

    static toApiFormat(plot) {
        return {
            name: plot.name,
            description: plot.description,
            organizationId: plot.organizationId
        };
    }
}