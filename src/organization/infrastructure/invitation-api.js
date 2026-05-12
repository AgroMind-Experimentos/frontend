import axios from 'axios';

export class InvitationApi {
    #http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

    async sendInvitationByEmail(orgId, email, agronomistId) {
        const { data } = await this.#http.post(`/api/v1/organizations/${orgId}/invite`, {
            email,
            agronomistId
        });
        return data;
    }

    async getPending(profileId) {
        const { data } = await this.#http.get(`/api/v1/invitations?profileId=${profileId}`);
        return data;
    }

    async accept(invitationId, profileId) {
        const { data } = await this.#http.post(`/api/v1/invitations/${invitationId}/accept`, { profileId });
        return data;
    }

    async reject(invitationId, profileId) {
        const { data } = await this.#http.post(`/api/v1/invitations/${invitationId}/reject`, { profileId });
        return data;
    }
}
