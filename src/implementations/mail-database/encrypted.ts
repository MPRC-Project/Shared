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

import type {
  IMailDatabase,
  Message,
  StoredMessage,
  User,
  ListMessagesOptions,
  PaginatedResult,
  IAttachmentStorage,
} from "../../index.js";
import type { IMessageEncryption } from "../../protocol/encryption/interface.js";
import type {
  EncryptedStoredMessage,
  StoredMessageUnion,
} from "../../protocol/encryption/types.js";
import { isEncryptedMessage } from "../../protocol/encryption/guards.js";

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
export class EncryptedMailDatabase implements IMailDatabase {
  private readonly inner: IMailDatabase;
  private readonly encryption: IMessageEncryption;
  private readonly allowDecryptionFailures: boolean;

  constructor(
    inner: IMailDatabase,
    encryption: IMessageEncryption,
    options: EncryptedMailDatabaseOptions = {},
  ) {
    this.inner = inner;
    this.encryption = encryption;
    this.allowDecryptionFailures = options.allowDecryptionFailures ?? false;
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  /**
   * Encrypts a `StoredMessage` and stores the result via the inner database.
   */
  private async encryptAndStore(message: StoredMessage): Promise<StoredMessage> {
    const encrypted = await this.encryption.encryptMessage(message);
    // Store the encrypted message — cast to Message to satisfy the inner interface
    // (the inner db only sees the plaintext routing fields + encrypted payload)
    const stored = await this.inner.storeMessage(encrypted as unknown as Message);
    // Return the original plaintext message to the caller
    return message;
  }

  /**
   * Decrypts a raw stored message union (which may be encrypted or plain).
   */
  private async decryptIfNeeded(
    raw: StoredMessageUnion,
  ): Promise<StoredMessage> {
    if (!isEncryptedMessage(raw)) {
      return raw as StoredMessage;
    }

    try {
      return await this.encryption.decryptMessage(raw);
    } catch (err) {
      if (this.allowDecryptionFailures) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(`[EncryptedMailDatabase] Failed to decrypt message ${raw.id}: ${reason}`);
        // Return a degraded placeholder so the caller can still see the message exists
        return {
          id: raw.id,
          from: raw.from,
          to: raw.to,
          subject: "[decryption failed]",
          body: [],
          receivedAt: raw.receivedAt,
          decryptionFailed: true,
          decryptionError: reason,
        } as DecryptionFailedMessage;
      }
      throw err;
    }
  }

  /**
   * Decrypts a list of raw stored messages.
   */
  private async decryptAll(raws: StoredMessageUnion[]): Promise<StoredMessage[]> {
    return Promise.all(raws.map((r) => this.decryptIfNeeded(r)));
  }

  // --------------------------------------------------------------------------
  // IMailDatabase — message operations
  // --------------------------------------------------------------------------

  async storeMessage(message: Message): Promise<StoredMessage> {
    // Build a StoredMessage for encryption. Attachments from Message are
    // MessageAttachment[] but StoredMessage expects AttachmentMetadata[].
    // The inner DB handles actual attachment storage; we encrypt only the
    // sensitive text fields. Omit attachments entirely to satisfy
    // exactOptionalPropertyTypes (setting undefined would be a type error).
    const { attachments: _attachments, ...messageWithoutAttachments } = message;
    const storedForEncryption: StoredMessage = {
      ...messageWithoutAttachments,
      receivedAt: new Date(),
    };

    // Encrypt the message payload
    const encryptedMsg = await this.encryption.encryptMessage(storedForEncryption);

    // Pass the encrypted form to the inner database.
    // We cast because the inner DB's storeMessage signature expects a Message,
    // but an EncryptedStoredMessage has the same routing fields + extra fields
    // that will just be stored as-is (JSON-serialisable).
    await this.inner.storeMessage(encryptedMsg as unknown as Message);

    // Return the plaintext stored message to the caller
    return storedForEncryption;
  }

  async getMessageById(id: string): Promise<StoredMessage | null> {
    const raw = await this.inner.getMessageById(id);
    if (!raw) return null;
    return this.decryptIfNeeded(raw as unknown as StoredMessageUnion);
  }

  async listMessages(
    email: string,
    options?: ListMessagesOptions,
  ): Promise<PaginatedResult<StoredMessage>> {
    const result = await this.inner.listMessages(email, options);
    const decrypted = await this.decryptAll(
      result.items as unknown as StoredMessageUnion[],
    );
    return { ...result, items: decrypted };
  }

  async getMessagesForUser(user: User): Promise<StoredMessage[]> {
    const raws = await this.inner.getMessagesForUser(user);
    return this.decryptAll(raws as unknown as StoredMessageUnion[]);
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.inner.deleteMessage(id);
  }

  async markMessageRead(id: string, read: boolean): Promise<boolean> {
    return this.inner.markMessageRead(id, read);
  }

  // --------------------------------------------------------------------------
  // Attachment storage pass-through
  // --------------------------------------------------------------------------

  setAttachmentStorage(storage: IAttachmentStorage): void {
    if ("setAttachmentStorage" in this.inner) {
      (this.inner as any).setAttachmentStorage(storage);
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.inner.initialize) {
      await this.inner.initialize();
    }
    console.log(
      `🔐 EncryptedMailDatabase initialized [backend: ${this.encryption.describe()}]`,
    );
  }

  async close(): Promise<void> {
    if (this.inner.close) {
      await this.inner.close();
    }
    console.log("🔐 EncryptedMailDatabase closed");
  }
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
export function createEncryptedMailDatabase(
  inner: IMailDatabase,
  encryption: IMessageEncryption,
  options?: EncryptedMailDatabaseOptions,
): EncryptedMailDatabase {
  return new EncryptedMailDatabase(inner, encryption, options);
}
