import { User } from '../domain/model/user.entity.js';
import { AuthToken } from '../domain/model/auth-token.entity.js';

export class AuthAssembler {
    toUser(dto) {
        return new User({
            id: dto?.id || null,
            name: dto?.displayName || dto?.name || '',
            email: dto?.email || '',
            role: dto?.role || ''
        });
    }

    toTokens(dto) {
        return new AuthToken({
            accessToken: dto?.accessToken || '',
            refreshToken: dto?.refreshToken || ''
        });
    }
}
