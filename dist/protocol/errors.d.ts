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
export declare abstract class MPRCError extends Error {
    /** Unique error code for programmatic error handling */
    abstract readonly code: string;
    /** HTTP-like status code for categorizing error severity */
    abstract readonly statusCode: number;
    /** Original error that caused this error, if any */
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error);
    /**
     * Converts the error to a JSON-serializable object for protocol responses.
     */
    toJSON(): Record<string, unknown>;
}
/**
 * General network-related error.
 * Used for issues with network operations that don't fit other categories.
 */
export declare class NetworkError extends MPRCError {
    readonly code: string;
    readonly statusCode = 500;
    constructor(code: string, message: string, cause?: Error);
}
/**
 * Error thrown when DNS resolution fails.
 * Includes the domain that failed to resolve for debugging.
 */
export declare class DnsResolutionError extends MPRCError {
    readonly code = "DNS_RESOLUTION_FAILED";
    readonly statusCode = 502;
    /** The domain that failed to resolve */
    readonly domain: string;
    constructor(message: string, domain: string, cause?: Error);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when a TCP connection cannot be established.
 * Includes host and port information for debugging.
 */
export declare class ConnectionError extends MPRCError {
    readonly code = "CONNECTION_FAILED";
    readonly statusCode = 503;
    /** Target host that failed to connect */
    readonly host: string;
    /** Target port that failed to connect */
    readonly port: number;
    constructor(message: string, host: string, port: number, cause?: Error);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when an operation times out.
 * Includes the timeout duration for debugging.
 */
export declare class TimeoutError extends MPRCError {
    readonly code = "TIMEOUT";
    readonly statusCode = 504;
    /** Timeout duration in milliseconds */
    readonly timeoutMs: number;
    constructor(message: string, timeoutMs: number, cause?: Error);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when received data is not valid JSON.
 */
export declare class InvalidJsonError extends MPRCError {
    readonly code = "INVALID_JSON";
    readonly statusCode = 400;
    constructor(message?: string, cause?: Error);
}
/**
 * Error thrown when a command doesn't match the expected MPRC format.
 */
export declare class InvalidCommandError extends MPRCError {
    readonly code = "INVALID_COMMAND";
    readonly statusCode = 400;
    /** The command type that was invalid, if known */
    readonly commandType?: string | undefined;
    constructor(message: string, commandType?: string, cause?: Error);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when a command type is not recognized.
 */
export declare class UnknownCommandError extends MPRCError {
    readonly code = "UNKNOWN_COMMAND";
    readonly statusCode = 400;
    /** The unrecognized command type */
    readonly commandType: string;
    constructor(commandType: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when protocol verification fails.
 */
export declare class ProtocolVerificationError extends MPRCError {
    readonly code = "PROTOCOL_VERIFICATION_FAILED";
    readonly statusCode = 502;
    /** The expected protocol identifier */
    readonly expected: string;
    /** The actual protocol identifier received */
    readonly received?: string | undefined;
    constructor(message: string, expected: string, received?: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when an email address format is invalid.
 */
export declare class InvalidEmailError extends MPRCError {
    readonly code = "INVALID_EMAIL";
    readonly statusCode = 400;
    /** The invalid email address */
    readonly email: string;
    constructor(email: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when a user cannot be found.
 */
export declare class UserNotFoundError extends MPRCError {
    readonly code = "USER_NOT_FOUND";
    readonly statusCode = 404;
    /** The email address that was not found */
    readonly email: string;
    constructor(email: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when sender verification fails.
 */
export declare class SenderVerificationError extends MPRCError {
    readonly code = "SENDER_VERIFICATION_FAILED";
    readonly statusCode = 403;
    /** The sender email that failed verification */
    readonly senderEmail: string;
    constructor(senderEmail: string, message?: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when message with specified ID is not found.
 */
export declare class MessageNotFoundError extends MPRCError {
    readonly code = "MESSAGE_NOT_FOUND";
    readonly statusCode = 404;
    /** The message ID that was not found */
    readonly messageId: string;
    constructor(messageId: string);
}
export declare class AttachmentNotFoundError extends MPRCError {
    readonly code = "ATTACHMENT_NOT_FOUND";
    readonly statusCode = 404;
    /** The content hash of the attachment that was not found */
    readonly contentHash: string;
    constructor(contentHash: string);
}
/**
 * Error thrown when a message cannot be delivered.
 */
export declare class MessageDeliveryError extends MPRCError {
    readonly code = "MESSAGE_DELIVERY_FAILED";
    readonly statusCode = 500;
    /** The message ID that failed to deliver */
    readonly messageId?: string | undefined;
    constructor(message: string, messageId?: string, cause?: Error);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when admin authentication is required but not provided.
 */
export declare class AdminAuthenticationRequiredError extends MPRCError {
    readonly code = "ADMIN_AUTH_REQUIRED";
    readonly statusCode = 401;
    /** The command that requires authentication */
    readonly commandType: string;
    constructor(commandType: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when admin authentication fails.
 */
export declare class AdminAuthenticationError extends MPRCError {
    readonly code = "ADMIN_AUTH_FAILED";
    readonly statusCode = 401;
    /** The reason authentication failed */
    readonly reason: string;
    constructor(reason: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when the admin public key is not found in server configuration.
 */
export declare class AdminKeyNotFoundError extends MPRCError {
    readonly code = "ADMIN_KEY_NOT_FOUND";
    readonly statusCode = 401;
    constructor();
}
/**
 * Error thrown when an admin signature is invalid.
 */
export declare class InvalidAdminSignatureError extends MPRCError {
    readonly code = "INVALID_ADMIN_SIGNATURE";
    readonly statusCode = 401;
    /** The name of the admin key that failed verification */
    readonly keyName?: string | undefined;
    constructor(keyName?: string);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when an admin signature is too old (replay attack prevention).
 */
export declare class SignatureTooOldError extends MPRCError {
    readonly code = "SIGNATURE_TOO_OLD";
    readonly statusCode = 401;
    /** Age of the signature in milliseconds */
    readonly ageMs: number;
    /** Maximum allowed age in milliseconds */
    readonly maxAgeMs: number;
    constructor(ageMs: number, maxAgeMs: number);
    toJSON(): Record<string, unknown>;
}
/**
 * Error thrown when a user provides an invalid password during sign-in.
 */
export declare class InvalidPasswordError extends MPRCError {
    readonly code = "INVALID_PASSWORD";
    readonly statusCode = 401;
    /** The email address for which the password was invalid */
    readonly email: string;
    constructor(email: string);
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=errors.d.ts.map