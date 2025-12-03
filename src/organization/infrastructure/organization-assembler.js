import { Organization } from '../domain/organization.entity.js';

export class OrganizationAssembler {
    /**
     * Transform API response to Organization entity
     * @param {Object} dto - Data from API
     * @param {Array} overrideMembers - Override members if backend doesn't return them
     * @returns {Organization}
     */
    toOrganization(dto, overrideMembers = null) {
        console.log('[OrganizationAssembler] Transformando DTO a Organization:', dto);
        console.log('[OrganizationAssembler] overrideMembers:', overrideMembers);

        // El backend puede devolver los datos en diferentes formatos
        const data = dto?.data || dto;

        // Si overrideMembers está presente, usarlo; sino, usar lo que venga del backend
        let members = Array.isArray(data?.members) ? data.members : [];
        if (overrideMembers !== null && Array.isArray(overrideMembers)) {
            members = overrideMembers;
            console.log('[OrganizationAssembler] 🔄 Usando members override:', members);
        }

        const organization = new Organization({
            id: data?.id || data?._id || null,
            name: data?.name || '',
            description: data?.description || '',
            status: data?.status || 'active',
            members: members,
            createdAt: data?.createdAt || data?.created_at || new Date().toISOString(),
            location: data?.location || ''
        });

        console.log('[OrganizationAssembler] Organization creada:', {
            id: organization.id,
            name: organization.name,
            membersCount: organization.getMemberCount()
        });

        return organization;
    }

    /**
     * Transform array of API responses to Organization entities
     * @param {Array} dtoList - Array of data from API
     * @returns {Array<Organization>}
     */
    toOrganizationArray(dtoList) {
        console.log('[OrganizationAssembler] Transformando array de DTOs:', dtoList);

        if (!Array.isArray(dtoList)) {
            console.warn('[OrganizationAssembler] La respuesta no es un array:', dtoList);
            return [];
        }

        const organizations = dtoList.map(dto => this.toOrganization(dto));
        console.log(`[OrganizationAssembler] Total organizaciones transformadas: ${organizations.length}`);

        return organizations;
    }

    /**
     * Transform form data to API format
     * @param {Object} formData - Data from form
     * @returns {Object}
     */
    fromFormData(formData) {
        console.log('[OrganizationAssembler] Transformando form data a API format:', formData);
        console.log('[OrganizationAssembler] 👥 Miembros recibidos del form:', formData.members);

        const apiData = {
            name: formData.name,
            description: formData.description || '',
            status: formData.status || 'active',
            members: Array.isArray(formData.members) ? formData.members : [],
            location: formData.location || '',
            createdAt: new Date().toISOString()
        };

        console.log('[OrganizationAssembler] 📤 API data generado:', apiData);
        console.log('[OrganizationAssembler] 👥 Miembros a enviar:', apiData.members);
        console.log('[OrganizationAssembler] 📊 Total miembros:', apiData.members.length);

        return apiData;
    }
}

