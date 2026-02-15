/**
 * Represents a user in the MPRC system.
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's password hash */
  passwordHash: string;
  /** Account creation timestamp */
  createdAt?: Date;
}

export interface JWTToken {
  /** The token string */
  token: string;
  /** Expiration date of the token */
  expiresAt: Date;
}
