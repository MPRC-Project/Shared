/**
 * Represents a user in the MPRC system.
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  username?: string;
  /** Account creation timestamp */
  createdAt?: Date;
}
