/**
 * Email address specification.
 * Can be a simple string or an object with name and address.
 */
export type EmailAddress = string | {
    name?: string;
    address: string;
};
/**
 * Attachment structure.
 */
export interface Attachment {
    /** Filename to be displayed */
    filename?: string;
    /** Content as string, buffer, or stream */
    content?: string | Buffer | NodeJS.ReadableStream;
    /** Content type (MIME type) */
    contentType?: string;
    /** Content disposition (inline or attachment) */
    contentDisposition?: "inline" | "attachment";
    /** Content ID for inline images */
    cid?: string;
    /** Encoding of the content (e.g., 'base64') */
    encoding?: string;
    /** Headers for the attachment part */
    headers?: Record<string, string | string[]>;
    /** Raw source to be used as is */
    raw?: string | Buffer | NodeJS.ReadableStream;
}
/**
 * Alternative content (e.g., text version of HTML email).
 */
export interface Alternative {
    /** Content as string */
    content: string;
    /** Content type (usually 'text/plain' or 'text/html') */
    contentType?: string;
    /** Headers for this alternative part */
    headers?: Record<string, string | string[]>;
}
/**
 * Complete email message options.
 */
export interface MessageOptions {
    /** Sender address (envelope `from`) */
    from?: EmailAddress;
    /** Recipient addresses */
    to?: EmailAddress | EmailAddress[];
    /** CC recipients */
    cc?: EmailAddress | EmailAddress[];
    /** BCC recipients */
    bcc?: EmailAddress | EmailAddress[];
    /** Reply-to address */
    replyTo?: EmailAddress;
    /** In-reply-to message ID (for threading) */
    inReplyTo?: string;
    /** References message IDs (for threading) */
    references?: string | string[];
    /** Envelope to use (overrides from/to) */
    envelope?: {
        from?: string;
        to?: string | string[];
    };
    /** Subject line */
    subject?: string;
    /** Plain text body */
    text?: string | Buffer | NodeJS.ReadableStream;
    /** HTML body */
    html?: string | Buffer | NodeJS.ReadableStream;
    /** AMP for Email (AMP4EMAIL) content */
    amp?: string | Buffer | NodeJS.ReadableStream;
    /** Attachments */
    attachments?: Attachment[];
    /** Alternative content (multipart/alternative) */
    alternatives?: Alternative[];
    /** List of custom headers */
    headers?: Record<string, string | string[] | {
        prepared: boolean;
        value: string;
    }>;
    /** List of list headers (RFC 2369) */
    list?: {
        help?: string;
        unsubscribe?: string | {
            url: string;
            comment?: string;
        }[];
        subscribe?: string;
        post?: string;
        owner?: string;
        archive?: string;
        id?: string;
    };
    /** Watch for delivery status notifications */
    dsn?: {
        id?: string;
        return?: "headers" | "full";
        notify?: "never" | "success" | "failure" | "delay" | ("success" | "failure" | "delay")[];
        recipient?: string;
    };
    /** Encoding to use for text/html parts */
    encoding?: string;
    /** Enable / disable file access for attachments */
    disableFileAccess?: boolean;
    /** Enable / disable URL access for attachments */
    disableUrlAccess?: boolean;
    /** Priority of the email */
    priority?: "high" | "normal" | "low";
    /** Custom message ID */
    messageId?: string;
    /** Date of the message */
    date?: Date | string;
    /** Custom X-Priority header */
    xPriority?: string | number;
    /** References header */
    referencesHeader?: string;
}
/**
 * Result of sending a message via Nodemailer.
 */
export interface SentMessageInfo {
    /** Message ID from the server */
    messageId: string;
    /** Envelope used */
    envelope: {
        from: string;
        to: string[];
    };
    /** Accepted recipients */
    accepted: string[];
    /** Rejected recipients */
    rejected: string[];
    /** Pending recipients */
    pending: string[];
    /** Response from the server */
    response: string;
    [key: string]: unknown;
}
//# sourceMappingURL=index.d.ts.map