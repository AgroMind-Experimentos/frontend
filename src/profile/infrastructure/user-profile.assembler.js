import { UserProfile } from '../domain/user-profile.entity.js';

export class UserProfileAssembler {
    toEntity(dto) {
        const user = new UserProfile({
            id: dto?.id || dto?._id || null,
            name: dto?.displayName || dto?.name || dto?.username || dto?.email?.split('@')[0] || '',
            email: dto?.email || '',
            avatar: dto?.avatar || dto?.profilePicture || dto?.picture || ''
        });
        return user;
    }

    toEntityList(dtoList) {
        if (!Array.isArray(dtoList)) {
            return [];
        }
        const users = dtoList.map(dto => this.toEntity(dto));
        return users;
    }
}

