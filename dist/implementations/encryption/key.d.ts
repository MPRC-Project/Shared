import type { Message, MessageAttachment, AttachmentMetadata } from "../../protocol/index.js";
import type { IEncryptionProvider } from "../../protocol/encryption/provider.js";
import type { EncryptedMessage, EncryptedMessageAttachment, EncryptedAttachmentMetadata } from "../../protocol/encryption/types.js";
export interface EncryptionKeyOptions {
    encryptionKey: string | Buffer;
}
export declare class EncryptionKeyEncryptionProvider implements IEncryptionProvider {
    readonly method: "EncryptionKey";
    private readonly key;
    constructor(options: EncryptionKeyOptions);
    encryptMessage(message: Message): Promise<EncryptedMessage>;
    decryptMessage(encrypted: EncryptedMessage): Promise<Message>;
    encryptAttachment(attachment: MessageAttachment): Promise<EncryptedMessageAttachment>;
    decryptAttachment(encrypted: EncryptedMessageAttachment): Promise<MessageAttachment>;
    tagAttachmentMetadata(metadata: AttachmentMetadata): EncryptedAttachmentMetadata;
}
export declare function createEncryptionKeyProvider(encryptionKey: string | Buffer): EncryptionKeyEncryptionProvider;
//# sourceMappingURL=key.d.ts.map