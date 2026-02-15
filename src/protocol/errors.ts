/**
 * MPRC Protocol - Error Types
 *
 * Standardized error classes for the MPRC protocol.
 * These errors provide structured error handling with codes
 * and contextual information for debugging and user feedback.
 */

/**
 * Base error class for all MPRC protocol errors.
 * Provides a consistent structure for error handling across the codebase.
 */
export abstract class MPRCError extends Error {
  /** Unique error code for programmatic error handling */
  abstract readonly code: string;
  /** HTTP-like status code for categorizing error severity */
  abstract readonly statusCode: number;
  /** Original error that caused this error, if any */
  readonly cause?: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Converts the error to a JSON-serializable object for protocol responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

// ============================================================================
// Network Errors (1xx codes)
// ============================================================================

/**
 * General network-related error.
 * Used for issues with network operations that don't fit other categories.
 */
export class NetworkError extends MPRCError {
  readonly code: string;
  readonly statusCode = 500;

  constructor(code: string, message: string, cause?: Error) {
    super(message, cause);
    this.code = code;
  }
}

/**
 * Error thrown when DNS resolution fails.
 * Includes the domain that failed to resolve for debugging.
 */
export class DnsResolutionError extends MPRCError {
  readonly code = "DNS_RESOLUTION_FAILED";
  readonly statusCode = 502;
  /** The domain that failed to resolve */
  readonly domain: string;

  constructor(message: string, domain: string, cause?: Error) {
    super(message, cause);
    this.domain = domain;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      domain: this.domain,
    };
  }
}

/**
 * Error thrown when a TCP connection cannot be established.
 * Includes host and port information for debugging.
 */
export class ConnectionError extends MPRCError {
  readonly code = "CONNECTION_FAILED";
  readonly statusCode = 503;
  /** Target host that failed to connect */
  readonly host: string;
  /** Target port that failed to connect */
  readonly port: number;

  constructor(message: string, host: string, port: number, cause?: Error) {
    super(message, cause);
    this.host = host;
    this.port = port;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      host: this.host,
      port: this.port,
    };
  }
}

/**
 * Error thrown when an operation times out.
 * Includes the timeout duration for debugging.
 */
export class TimeoutError extends MPRCError {
  readonly code = "TIMEOUT";
  readonly statusCode = 504;
  /** Timeout duration in milliseconds */
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, cause?: Error) {
    super(message, cause);
    this.timeoutMs = timeoutMs;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      timeoutMs: this.timeoutMs,
    };
  }
}

// ============================================================================
// Protocol Errors (2xx codes)
// ============================================================================

/**
 * Error thrown when received data is not valid JSON.
 */
export class InvalidJsonError extends MPRCError {
  readonly code = "INVALID_JSON";
  readonly statusCode = 400;

  constructor(message: string = "Data is not valid JSON", cause?: Error) {
    super(message, cause);
  }
}

/**
 * Error thrown when a command doesn't match the expected MPRC format.
 */
export class InvalidCommandError extends MPRCError {
  readonly code = "INVALID_COMMAND";
  readonly statusCode = 400;
  /** The command type that was invalid, if known */
  readonly commandType?: string | undefined;

  constructor(message: string, commandType?: string, cause?: Error) {
    super(message, cause);
    this.commandType = commandType;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      commandType: this.commandType,
    };
  }
}

/**
 * Error thrown when a command type is not recognized.
 */
export class UnknownCommandError extends MPRCError {
  readonly code = "UNKNOWN_COMMAND";
  readonly statusCode = 400;
  /** The unrecognized command type */
  readonly commandType: string;

  constructor(commandType: string) {
    super(`Unknown command: ${commandType}`);
    this.commandType = commandType;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      commandType: this.commandType,
    };
  }
}

/**
 * Error thrown when protocol verification fails.
 */
export class ProtocolVerificationError extends MPRCError {
  readonly code = "PROTOCOL_VERIFICATION_FAILED";
  readonly statusCode = 502;
  /** The expected protocol identifier */
  readonly expected: string;
  /** The actual protocol identifier received */
  readonly received?: string | undefined;

  constructor(message: string, expected: string, received?: string) {
    super(message);
    this.expected = expected;
    this.received = received;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      expected: this.expected,
      received: this.received,
    };
  }
}

// ============================================================================
// User/Message Errors (3xx codes)
// ============================================================================

/**
 * Error thrown when an email address format is invalid.
 */
export class InvalidEmailError extends MPRCError {
  readonly code = "INVALID_EMAIL";
  readonly statusCode = 400;
  /** The invalid email address */
  readonly email: string;

  constructor(email: string) {
    super(`Invalid email address format: ${email}`);
    this.email = email;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      email: this.email,
    };
  }
}

/**
 * Error thrown when a user cannot be found.
 */
export class UserNotFoundError extends MPRCError {
  readonly code = "USER_NOT_FOUND";
  readonly statusCode = 404;
  /** The email address that was not found */
  readonly email: string;

  constructor(email: string) {
    super(`User not found: ${email}`);
    this.email = email;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      email: this.email,
    };
  }
}

/**
 * Error thrown when sender verification fails.
 */
export class SenderVerificationError extends MPRCError {
  readonly code = "SENDER_VERIFICATION_FAILED";
  readonly statusCode = 403;
  /** The sender email that failed verification */
  readonly senderEmail: string;

  constructor(senderEmail: string, message?: string) {
    super(message ?? `Sender verification failed: ${senderEmail}`);
    this.senderEmail = senderEmail;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      senderEmail: this.senderEmail,
    };
  }
}

/**
 * Error thrown when message with specified ID is not found.
 */
export class MessageNotFoundError extends MPRCError {
  readonly code = "MESSAGE_NOT_FOUND";
  readonly statusCode = 404;
  /** The message ID that was not found */
  readonly messageId: string;

  constructor(messageId: string) {
    super(`Message not found: ${messageId}`);
    this.messageId = messageId;
  }
}

export class AttachmentNotFoundError extends MPRCError {
  readonly code = "ATTACHMENT_NOT_FOUND";
  readonly statusCode = 404;
  /** The content hash of the attachment that was not found */
  readonly contentHash: string;

  constructor(contentHash: string) {
    super(`Attachment not found: ${contentHash}`);
    this.contentHash = contentHash;
  }
}

/**
 * Error thrown when a message cannot be delivered.
 */
export class MessageDeliveryError extends MPRCError {
  readonly code = "MESSAGE_DELIVERY_FAILED";
  readonly statusCode = 500;
  /** The message ID that failed to deliver */
  readonly messageId?: string | undefined;

  constructor(message: string, messageId?: string, cause?: Error) {
    super(message, cause);
    this.messageId = messageId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      messageId: this.messageId,
    };
  }
}

/**
 * Error thrown when admin authentication is required but not provided.
 */
export class AdminAuthenticationRequiredError extends MPRCError {
  readonly code = "ADMIN_AUTH_REQUIRED";
  readonly statusCode = 401;
  /** The command that requires authentication */
  readonly commandType: string;

  constructor(commandType: string) {
    super(
      `Command ${commandType} requires admin authentication. Please provide valid adminAuth with your request.`,
    );
    this.commandType = commandType;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      commandType: this.commandType,
    };
  }
}

/**
 * Error thrown when admin authentication fails.
 */
export class AdminAuthenticationError extends MPRCError {
  readonly code = "ADMIN_AUTH_FAILED";
  readonly statusCode = 401;
  /** The reason authentication failed */
  readonly reason: string;

  constructor(reason: string) {
    super(`Admin authentication failed: ${reason}`);
    this.reason = reason;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      reason: this.reason,
    };
  }
}

/**
 * Error thrown when the admin public key is not found in server configuration.
 */
export class AdminKeyNotFoundError extends MPRCError {
  readonly code = "ADMIN_KEY_NOT_FOUND";
  readonly statusCode = 401;

  constructor() {
    super(
      "Admin public key not found in server configuration. Ensure your public key is registered in the server's adminKeys configuration.",
    );
  }
}

/**
 * Error thrown when an admin signature is invalid.
 */
export class InvalidAdminSignatureError extends MPRCError {
  readonly code = "INVALID_ADMIN_SIGNATURE";
  readonly statusCode = 401;
  /** The name of the admin key that failed verification */
  readonly keyName?: string | undefined;

  constructor(keyName?: string) {
    super(
      keyName
        ? `Invalid admin signature for key "${keyName}". Signature verification failed.`
        : "Invalid admin signature. Signature verification failed.",
    );
    this.keyName = keyName;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      keyName: this.keyName,
    };
  }
}

/**
 * Error thrown when an admin signature is too old (replay attack prevention).
 */
export class SignatureTooOldError extends MPRCError {
  readonly code = "SIGNATURE_TOO_OLD";
  readonly statusCode = 401;
  /** Age of the signature in milliseconds */
  readonly ageMs: number;
  /** Maximum allowed age in milliseconds */
  readonly maxAgeMs: number;

  constructor(ageMs: number, maxAgeMs: number) {
    super(
      `Admin signature is too old (${Math.floor(ageMs / 1000)}s). Maximum age is ${Math.floor(maxAgeMs / 1000)}s. Please create a new signature.`,
    );
    this.ageMs = ageMs;
    this.maxAgeMs = maxAgeMs;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ageMs: this.ageMs,
      maxAgeMs: this.maxAgeMs,
    };
  }
}

/**
 * Error thrown when a user provides an invalid password during sign-in.
 */
export class InvalidPasswordError extends MPRCError {
  readonly code = "INVALID_PASSWORD";
  readonly statusCode = 401;
  /** The email address for which the password was invalid */
  readonly email: string;

  constructor(email: string) {
    super(`Invalid password for user: ${email}`);
    this.email = email;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      email: this.email,
    };
  }
}
