import type { User, IUserDatabase } from "../../index.js";

class InMemoryUserDatabase implements IUserDatabase {
  private users: Map<string, User> = new Map();

  async createUser(user: User): Promise<User> {
    if (this.users.has(user.id)) {
      throw new Error(`User with ID ${user.id} already exists`);
    }
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id">>,
  ): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async userExists(email: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async clear(): Promise<void> {
    this.users.clear();
  }

  async initialize(): Promise<void> {
    console.log("User database initialized");
    return Promise.resolve();
  }
}

export function createDefaultUserDatabase(): InMemoryUserDatabase {
  const db = new InMemoryUserDatabase();
  return db;
}
