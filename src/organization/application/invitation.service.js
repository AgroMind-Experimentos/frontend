import { reactive } from 'vue';
import { InvitationApi } from '../infrastructure/invitation-api.js';

class InvitationService {
    state = reactive({ invitations: [], loading: false });
    #api = new InvitationApi();

    async fetchPending(profileId) {
        this.state.loading = true;
        try {
            this.state.invitations = await this.#api.getPending(profileId);
        } finally {
            this.state.loading = false;
        }
    }

    async sendInvitationByEmail(orgId, email, agronomistId) {
        return await this.#api.sendInvitationByEmail(orgId, email, agronomistId);
    }

    async accept(invitationId, profileId) {
        await this.#api.accept(invitationId, profileId);
        this.state.invitations = this.state.invitations.filter(i => i.id !== invitationId);
    }

    async reject(invitationId, profileId) {
        await this.#api.reject(invitationId, profileId);
        this.state.invitations = this.state.invitations.filter(i => i.id !== invitationId);
    }
}

export const invitationService = new InvitationService();
