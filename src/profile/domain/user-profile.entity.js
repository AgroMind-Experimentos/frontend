export class UserProfile {
    constructor({ id = null, name = '', email = '', avatar = '' } = {}) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar || `https://i.pravatar.cc/100?img=${id || Math.floor(Math.random() * 70)}`;
    }
}

