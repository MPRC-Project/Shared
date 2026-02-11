import type { User } from "../index.js";
/**
 * User Database Interface
 * Defines the contract for user storage implementations.
 *
 * @example
 * ```typescript
 * class PostgresUserDatabase implements UserDatabase {
 *  async getUserByEmail(email: string): Promise<User | null> {
 *     // Implementation to retrieve user from PostgreSQL
 *   }
 *
 *  async createUser(user: Omit<User, "createdAt">): Promise<User> {
 *    // Implementation to create user in PostgreSQL
 *  }
 * }
 */
export interface UserDatabase {
    /**
     * Retrieves a user by their email address.
     *
     * @param email - The email address to look up
     * @returns The user if found, null otherwise
     */
    getUserByEmail(email: string): Promise<User | null>;
    /**
     * Retrieves a user by their unique ID.
     *
     * @param id - The user's unique identifier
     * @returns The user if found, null otherwise
     */
    getUserById(id: string): Promise<User | null>;
    /**
     * Creates a new user.
     *
     * @param user - The user data to create
     * @returns The created user with any generated fields
     * @throws If user creation fails (e.g., duplicate email)
     */
    createUser(user: Omit<User, "createdAt">): Promise<User>;
    /**
     * Updates an existing user.
     *
     * @param id - The user's unique identifier
     * @param updates - Partial user data to update
     * @returns The updated user
     * @throws If user not found or update fails
     */
    updateUser(id: string, updates: Partial<Omit<User, "id">>): Promise<User>;
    /**
     * Checks if a user with the given email exists.
     *
     * @param email - The email address to check
     * @returns True if the user exists
     */
    userExists(email: string): Promise<boolean>;
    /**
     * Initializes the database connection and schema.
     * Called once when the server starts.
     */
    initialize?(): Promise<void>;
    /**
     * Closes the database connection.
     * Called when the server shuts down.
     */
    close?(): Promise<void>;
}
//# sourceMappingURL=user-storage.d.ts.map