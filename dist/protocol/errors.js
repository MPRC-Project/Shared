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
export class MPRCError extends Error {
    /** Original error that caused this error, if any */
    cause;
    constructor(message, cause) {
        super(message);
        this.name = this.constructor.name;
        this.cause = cause;
        Error.captureStackTrace?.(this, this.constructor);
    }
    /**
     * Converts the error to a JSON-serializable object for protocol responses.
     */
    toJSON() {
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
    code;
    statusCode = 500;
    constructor(code, message, cause) {
        super(message, cause);
        this.code = code;
    }
}
/**
 * Error thrown when DNS resolution fails.
 * Includes the domain that failed to resolve for debugging.
 */
export class DnsResolutionError extends MPRCError {
    code = "DNS_RESOLUTION_FAILED";
    statusCode = 502;
    /** The domain that failed to resolve */
    domain;
    constructor(message, domain, cause) {
        super(message, cause);
        this.domain = domain;
    }
    toJSON() {
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
    code = "CONNECTION_FAILED";
    statusCode = 503;
    /** Target host that failed to connect */
    host;
    /** Target port that failed to connect */
    port;
    constructor(message, host, port, cause) {
        super(message, cause);
        this.host = host;
        this.port = port;
    }
    toJSON() {
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
    code = "TIMEOUT";
    statusCode = 504;
    /** Timeout duration in milliseconds */
    timeoutMs;
    constructor(message, timeoutMs, cause) {
        super(message, cause);
        this.timeoutMs = timeoutMs;
    }
    toJSON() {
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
    code = "INVALID_JSON";
    statusCode = 400;
    constructor(message = "Data is not valid JSON", cause) {
        super(message, cause);
    }
}
/**
 * Error thrown when a command doesn't match the expected MPRC format.
 */
export class InvalidCommandError extends MPRCError {
    code = "INVALID_COMMAND";
    statusCode = 400;
    /** The command type that was invalid, if known */
    commandType;
    constructor(message, commandType, cause) {
        super(message, cause);
        this.commandType = commandType;
    }
    toJSON() {
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
    code = "UNKNOWN_COMMAND";
    statusCode = 400;
    /** The unrecognized command type */
    commandType;
    constructor(commandType) {
        super(`Unknown command: ${commandType}`);
        this.commandType = commandType;
    }
    toJSON() {
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
    code = "PROTOCOL_VERIFICATION_FAILED";
    statusCode = 502;
    /** The expected protocol identifier */
    expected;
    /** The actual protocol identifier received */
    received;
    constructor(message, expected, received) {
        super(message);
        this.expected = expected;
        this.received = received;
    }
    toJSON() {
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
    code = "INVALID_EMAIL";
    statusCode = 400;
    /** The invalid email address */
    email;
    constructor(email) {
        super(`Invalid email address format: ${email}`);
        this.email = email;
    }
    toJSON() {
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
    code = "USER_NOT_FOUND";
    statusCode = 404;
    /** The email address that was not found */
    email;
    constructor(email) {
        super(`User not found: ${email}`);
        this.email = email;
    }
    toJSON() {
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
    code = "SENDER_VERIFICATION_FAILED";
    statusCode = 403;
    /** The sender email that failed verification */
    senderEmail;
    constructor(senderEmail, message) {
        super(message ?? `Sender verification failed: ${senderEmail}`);
        this.senderEmail = senderEmail;
    }
    toJSON() {
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
    code = "MESSAGE_NOT_FOUND";
    statusCode = 404;
    /** The message ID that was not found */
    messageId;
    constructor(messageId) {
        super(`Message not found: ${messageId}`);
        this.messageId = messageId;
    }
}
export class AttachmentNotFoundError extends MPRCError {
    code = "ATTACHMENT_NOT_FOUND";
    statusCode = 404;
    /** The content hash of the attachment that was not found */
    contentHash;
    constructor(contentHash) {
        super(`Attachment not found: ${contentHash}`);
        this.contentHash = contentHash;
    }
}
/**
 * Error thrown when a message cannot be delivered.
 */
export class MessageDeliveryError extends MPRCError {
    code = "MESSAGE_DELIVERY_FAILED";
    statusCode = 500;
    /** The message ID that failed to deliver */
    messageId;
    constructor(message, messageId, cause) {
        super(message, cause);
        this.messageId = messageId;
    }
    toJSON() {
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
    code = "ADMIN_AUTH_REQUIRED";
    statusCode = 401;
    /** The command that requires authentication */
    commandType;
    constructor(commandType) {
        super(`Command ${commandType} requires admin authentication. Please provide valid adminAuth with your request.`);
        this.commandType = commandType;
    }
    toJSON() {
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
    code = "ADMIN_AUTH_FAILED";
    statusCode = 401;
    /** The reason authentication failed */
    reason;
    constructor(reason) {
        super(`Admin authentication failed: ${reason}`);
        this.reason = reason;
    }
    toJSON() {
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
    code = "ADMIN_KEY_NOT_FOUND";
    statusCode = 401;
    constructor() {
        super("Admin public key not found in server configuration. Ensure your public key is registered in the server's adminKeys configuration.");
    }
}
/**
 * Error thrown when an admin signature is invalid.
 */
export class InvalidAdminSignatureError extends MPRCError {
    code = "INVALID_ADMIN_SIGNATURE";
    statusCode = 401;
    /** The name of the admin key that failed verification */
    keyName;
    constructor(keyName) {
        super(keyName
            ? `Invalid admin signature for key "${keyName}". Signature verification failed.`
            : "Invalid admin signature. Signature verification failed.");
        this.keyName = keyName;
    }
    toJSON() {
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
    code = "SIGNATURE_TOO_OLD";
    statusCode = 401;
    /** Age of the signature in milliseconds */
    ageMs;
    /** Maximum allowed age in milliseconds */
    maxAgeMs;
    constructor(ageMs, maxAgeMs) {
        super(`Admin signature is too old (${Math.floor(ageMs / 1000)}s). Maximum age is ${Math.floor(maxAgeMs / 1000)}s. Please create a new signature.`);
        this.ageMs = ageMs;
        this.maxAgeMs = maxAgeMs;
    }
    toJSON() {
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
    code = "INVALID_PASSWORD";
    statusCode = 401;
    /** The email address for which the password was invalid */
    email;
    constructor(email) {
        super(`Invalid password for user: ${email}`);
        this.email = email;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            email: this.email,
        };
    }
}
/**
 * Error thrown when a JWT token is invalid (e.g. expired, malformed).
 */
export class InvalidJWTTokenError extends MPRCError {
    code = "INVALID_JWT_TOKEN";
    statusCode = 401;
    /** The reason the JWT token is invalid (e.g. expired, malformed) */
    reason;
    constructor(reason) {
        super(`Invalid JWT token: ${reason}`);
        this.reason = reason;
    }
    toJSON() {
        return {
            ...super.toJSON(),
            reason: this.reason,
        };
    }
}
//# sourceMappingURL=errors.js.map