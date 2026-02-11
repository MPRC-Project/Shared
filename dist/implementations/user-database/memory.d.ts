import type { User, UserDatabase } from "../../index.js";
declare class InMemoryUserDatabase implements UserDatabase {
    private users;
    createUser(user: User): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    updateUser(id: string, updates: Partial<Omit<User, "id">>): Promise<User>;
    userExists(email: string): Promise<boolean>;
    deleteUser(id: string): Promise<boolean>;
    listUsers(): Promise<User[]>;
    clear(): Promise<void>;
    initialize(): Promise<void>;
}
export declare function createDefaultUserDatabase(): InMemoryUserDatabase;
export {};
//# sourceMappingURL=memory.d.ts.map