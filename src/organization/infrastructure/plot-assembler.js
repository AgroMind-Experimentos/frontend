import { Plot } from '../domain/plot.entity.js';

export class PlotAssembler {
    /**
     * Parsea la descripción y extrae campos estructurados
     * Formato esperado: "Área: 5.2 ha | Ubicación: Norte | Cultivo: Maíz | Miembros: 3"
     * @param {string} description - Descripción de la plota
     * @returns {Object} - Objeto con los campos parseados
     */
    static parseDescription(description) {
        if (!description) return {};

        const data = {};
        const parts = description.split('|').map(p => p.trim());

        parts.forEach(part => {
            if (part.includes('Área:')) {
                data.area = part.replace('Área:', '').trim();
            } else if (part.includes('Ubicación:')) {
                data.location = part.replace('Ubicación:', '').trim();
            } else if (part.includes('Cultivo:')) {
                data.crop = part.replace('Cultivo:', '').trim();
            } else if (part.includes('Miembros:')) {
                const count = part.replace('Miembros:', '').trim();
                data.membersCount = parseInt(count) || 0;
            }
        });

        return data;
    }

    /**
     * Converts API response to domain entity
     * Automáticamente parsea la descripción para extraer campos estructurados
     * @param {Object} response - API response object
     * @returns {Plot}
     */
    static toEntityFromResponse(response) {
        const parsedData = this.parseDescription(response.description);

        return new Plot({
            id: response.id,
            organizationId: response.organizationId,
            name: response.name,
            description: response.description,
            area: response.area ?? parsedData.area ?? '',
            location: response.location || parsedData.location || '',
            crop: response.cultivation || response.crop || parsedData.crop || '',
            createdAt: response.createdAt,
            status: response.status || 'active',
            members: response.memberIds || response.members || []
        });
    }

    /**
     * Converts create/update form data to API format
     * Construye una descripción rica con todos los datos del formulario
     * @param {Object} formData - Form data from UI
     * @returns {Object}
     */
    static fromFormData(formData) {
        // Construir la descripción con toda la información del formulario
        const descriptionParts = [];

        if (formData.area && formData.area.trim()) {
            descriptionParts.push(`Área: ${formData.area.trim()}`);
        }
        if (formData.location && formData.location.trim()) {
            descriptionParts.push(`Ubicación: ${formData.location.trim()}`);
        }
        if (formData.crop && formData.crop.trim()) {
            descriptionParts.push(`Cultivo: ${formData.crop.trim()}`);
        }
        if (formData.members && formData.members.length > 0) {
            descriptionParts.push(`Miembros: ${formData.members.length}`);
        }

        const description = descriptionParts.join(' | ');

        return {
            name: formData.name,
            location: formData.location || '',
            area: parseFloat(formData.area) || 0,
            cultivation: formData.crop || '',
            organizationId: parseInt(formData.organizationId)
        };
    }

    /**
     * Converts domain entity to API format
     * @param {Plot} plot - Plot domain entity
     * @returns {Object}
     */
    static toApiFormat(plot) {
        return {
            name: plot.name,
            description: plot.description,
            organizationId: plot.organizationId
        };
    }
}

