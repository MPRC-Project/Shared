import { symmetricEncrypt, symmetricDecrypt, resolveKeyBuffer, } from "./utils.js";
export class EncryptionKeyEncryptionProvider {
    method = "EncryptionKey";
    key;
    constructor(options) {
        this.key = resolveKeyBuffer(options.encryptionKey);
    }
    async encryptMessage(message) {
        const sensitive = {
            subject: message.subject,
            body: message.body,
            sentAt: message.sentAt,
            responseTo: message.responseTo,
            tags: message.tags,
            folder: message.folder,
        };
        return {
            __encrypted: true,
            encryptionMethod: "EncryptionKey",
            id: message.id,
            from: message.from,
            to: message.to,
            receivedAt: message.receivedAt,
            encryptedPayload: symmetricEncrypt(JSON.stringify(sensitive), this.key),
        };
    }
    async decryptMessage(encrypted) {
        const json = symmetricDecrypt(encrypted.encryptedPayload, this.key);
        const sensitive = JSON.parse(json);
        return {
            id: encrypted.id,
            from: encrypted.from,
            to: encrypted.to,
            receivedAt: encrypted.receivedAt,
            subject: sensitive.subject,
            body: sensitive.body,
            sentAt: sensitive.sentAt,
            responseTo: sensitive.responseTo,
            tags: sensitive.tags,
            folder: sensitive.folder,
        };
    }
    async encryptAttachment(attachment) {
        return {
            __encrypted: true,
            encryptionMethod: "EncryptionKey",
            id: attachment.id,
            filename: attachment.filename,
            encryptedContent: symmetricEncrypt(attachment.content, this.key),
            size: attachment.size,
            mimeType: attachment.mimeType,
        };
    }
    async decryptAttachment(encrypted) {
        return {
            id: encrypted.id,
            filename: encrypted.filename,
            content: symmetricDecrypt(encrypted.encryptedContent, this.key),
            size: encrypted.size,
            mimeType: encrypted.mimeType,
        };
    }
    tagAttachmentMetadata(metadata) {
        return {
            ...metadata,
            __encrypted: true,
            encryptionMethod: "EncryptionKey",
        };
    }
}
export function createEncryptionKeyProvider(encryptionKey) {
    return new EncryptionKeyEncryptionProvider({ encryptionKey });
}
//# sourceMappingURL=key.js.map