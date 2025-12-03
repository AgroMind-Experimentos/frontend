import { UserProfile } from '../domain/user-profile.entity.js';

export class UserProfileAssembler {
    toEntity(dto) {
        console.log('🔄 Transformando usuario:', dto);
        const user = new UserProfile({
            id: dto?.id || dto?._id || null,
            name: dto?.displayName || dto?.name || dto?.username || dto?.email?.split('@')[0] || '',
            email: dto?.email || '',
            avatar: dto?.avatar || dto?.profilePicture || dto?.picture || ''
        });
        console.log('✅ Usuario transformado:', user);
        return user;
    }

    toEntityList(dtoList) {
        console.log('🔄 Transformando lista de usuarios:', dtoList);
        if (!Array.isArray(dtoList)) {
            console.warn('⚠️ La respuesta no es un array:', dtoList);
            return [];
        }
        const users = dtoList.map(dto => this.toEntity(dto));
        console.log('✅ Total usuarios transformados:', users.length);
        return users;
    }
}

