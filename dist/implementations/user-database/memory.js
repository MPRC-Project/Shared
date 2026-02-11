class InMemoryUserDatabase {
    users = new Map();
    async createUser(user) {
        if (this.users.has(user.id)) {
            throw new Error(`User with ID ${user.id} already exists`);
        }
        this.users.set(user.id, user);
        return user;
    }
    async getUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                return user;
            }
        }
        return null;
    }
    async getUserById(id) {
        return this.users.get(id) || null;
    }
    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error(`User with ID ${id} not found`);
        }
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async userExists(email) {
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    async deleteUser(id) {
        return this.users.delete(id);
    }
    async listUsers() {
        return Array.from(this.users.values());
    }
    async clear() {
        this.users.clear();
    }
    async initialize() {
        console.log("User database initialized");
        return Promise.resolve();
    }
}
export function createDefaultUserDatabase() {
    const db = new InMemoryUserDatabase();
    return db;
}
//# sourceMappingURL=memory.js.map