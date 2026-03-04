import type { AttachmentMetadata, MessageAttachment } from "../message/attachment.js";
import type { Message, StoredMessage } from "../message/message.js";
export type EncryptionMethod = "EncryptionKey";
export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
    authTag: string;
}
/**
 * Routing fields (id, from, to, receivedAt) remain in plaintext.
 * Sensitive content (subject, body, metadata) lives in encryptedPayload.
 */
export interface EncryptedMessage {
    readonly __encrypted: true;
    encryptionMethod: EncryptionMethod;
    id: string;
    from: string;
    to: string;
    receivedAt?: Date | undefined;
    encryptedPayload: EncryptedPayload;
}
export interface EncryptedStoredMessage extends EncryptedMessage {
    attachments?: EncryptedAttachmentMetadata[];
}
export type MessageSensitivePayload = {
    subject: string;
    body: Message["body"];
    sentAt?: Date | undefined;
    responseTo?: string | undefined;
    tags?: string[] | undefined;
    folder?: string | undefined;
};
export interface EncryptedMessageAttachment {
    readonly __encrypted: true;
    encryptionMethod: EncryptionMethod;
    id: string;
    filename: string;
    encryptedContent: EncryptedPayload;
    size?: number | undefined;
    mimeType?: string | undefined;
}
export interface EncryptedAttachmentMetadata extends AttachmentMetadata {
    readonly __encrypted: true;
    encryptionMethod: EncryptionMethod;
}
export type AnyStoredMessage = StoredMessage | EncryptedStoredMessage;
export declare function isEncryptedStoredMessage(msg: AnyStoredMessage): msg is EncryptedStoredMessage;
export declare function isEncryptedMessageAttachment(att: MessageAttachment | EncryptedMessageAttachment): att is EncryptedMessageAttachment;
export declare function isEncryptedAttachmentMetadata(att: AttachmentMetadata): att is EncryptedAttachmentMetadata;
//# sourceMappingURL=types.d.ts.map