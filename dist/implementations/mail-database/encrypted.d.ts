/**
 * MPRC Server - Encrypted Mail Database
 *
 * A decorator/wrapper around any `IMailDatabase` implementation that
 * transparently encrypts messages before storage and decrypts them on retrieval.
 *
 * ## Usage
 * ```typescript
 * const baseDb = new InMemoryMailDatabase();
 * const encryption = new SecretKeyEncryption({ secretKey: process.env.ENC_KEY! });
 * const db = new EncryptedMailDatabase(baseDb, encryption);
 *
 * await db.initialize();
 *
 * // Messages are automatically encrypted before being passed to baseDb,
 * // and automatically decrypted when retrieved.
 * await db.storeMessage(myMessage);
 * const msg = await db.getMessageById(myMessage.id); // returns plaintext StoredMessage
 * ```
 *
 * @module implementations/mail-database/encrypted
 */
import type { IMailDatabase, Message, StoredMessage, User, ListMessagesOptions, PaginatedResult, IAttachmentStorage } from "../../index.js";
import type { IMessageEncryption } from "../../protocol/encryption/interface.js";
/**
 * Configuration for `EncryptedMailDatabase`.
 */
export interface EncryptedMailDatabaseOptions {
    /**
     * When `true`, messages that fail decryption are returned as-is in a
     * degraded state (with empty body and a `decryptionError` flag) rather
     * than throwing. Useful for bulk listing operations where one bad message
     * should not block the entire result set.
     *
     * @default false
     */
    allowDecryptionFailures?: boolean;
}
/**
 * A `StoredMessage` annotated with a decryption failure reason.
 * Returned only when `allowDecryptionFailures: true`.
 */
export interface DecryptionFailedMessage extends StoredMessage {
    decryptionFailed: true;
    decryptionError: string;
}
/**
 * Mail database decorator that encrypts messages at rest.
 *
 * Wraps any `IMailDatabase` implementation and intercepts all read/write
 * operations to transparently encrypt messages before storage and decrypt
 * them on retrieval. Callers interact with plaintext `StoredMessage` objects
 * as normal; encryption is completely transparent.
 *
 * ## Encryption scope
 * - **Encrypted**: `subject`, `body`, `sentAt`, `responseTo`, `tags`, `folder`,
 *   and all attachment metadata (filenames, MIME types).
 * - **Plaintext** (required for server-side operations): `id`, `from`, `to`,
 *   `receivedAt`.
 *
 * ## Attachment content
 * Attachment *content blobs* are encrypted by the `EncryptedAttachmentStorage`
 * wrapper, not by this class. This class only encrypts attachment *metadata*.
 *
 * @example
 * ```typescript
 * const db = new EncryptedMailDatabase(
 *   new InMemoryMailDatabase(),
 *   new SecretKeyEncryption({ secretKey: key }),
 * );
 * ```
 */
export declare class EncryptedMailDatabase implements IMailDatabase {
    private readonly inner;
    private readonly encryption;
    private readonly allowDecryptionFailures;
    constructor(inner: IMailDatabase, encryption: IMessageEncryption, options?: EncryptedMailDatabaseOptions);
    /**
     * Encrypts a `StoredMessage` and stores the result via the inner database.
     */
    private encryptAndStore;
    /**
     * Decrypts a raw stored message union (which may be encrypted or plain).
     */
    private decryptIfNeeded;
    /**
     * Decrypts a list of raw stored messages.
     */
    private decryptAll;
    storeMessage(message: Message): Promise<StoredMessage>;
    getMessageById(id: string): Promise<StoredMessage | null>;
    listMessages(email: string, options?: ListMessagesOptions): Promise<PaginatedResult<StoredMessage>>;
    getMessagesForUser(user: User): Promise<StoredMessage[]>;
    deleteMessage(id: string): Promise<boolean>;
    markMessageRead(id: string, read: boolean): Promise<boolean>;
    setAttachmentStorage(storage: IAttachmentStorage): void;
    initialize(): Promise<void>;
    close(): Promise<void>;
}
/**
 * Creates an `EncryptedMailDatabase` wrapping the provided database.
 *
 * @example
 * ```typescript
 * const db = createEncryptedMailDatabase(
 *   new InMemoryMailDatabase(),
 *   new SecretKeyEncryption({ secretKey: key }),
 * );
 * ```
 */
export declare function createEncryptedMailDatabase(inner: IMailDatabase, encryption: IMessageEncryption, options?: EncryptedMailDatabaseOptions): EncryptedMailDatabase;
//# sourceMappingURL=encrypted.d.ts.map