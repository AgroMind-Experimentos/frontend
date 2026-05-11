import axios from 'axios';

export class InvitationApi {
    #http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
    #orgsEndpoint = import.meta.env.VITE_ORGANIZATIONS_ENDPOINT;
    #invitationsEndpoint = import.meta.env.VITE_INVITATIONS_ENDPOINT;

    async sendInvitationByEmail(orgId, email, agronomistId) {
        const { data } = await this.#http.post(`${this.#orgsEndpoint}/${orgId}/invite`, {
            email,
            agronomistId
        });
        return data;
    }

    async getPending(profileId) {
        const { data } = await this.#http.get(`${this.#invitationsEndpoint}?profileId=${profileId}`);
        return data;
    }

    async accept(invitationId, profileId) {
        const { data } = await this.#http.post(`${this.#invitationsEndpoint}/${invitationId}/accept`, { profileId });
        return data;
    }

    async reject(invitationId, profileId) {
        const { data } = await this.#http.post(`${this.#invitationsEndpoint}/${invitationId}/reject`, { profileId });
        return data;
    }
}
