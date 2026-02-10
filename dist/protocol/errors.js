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
//# sourceMappingURL=errors.js.map