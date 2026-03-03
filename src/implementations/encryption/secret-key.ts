/**
 * MPRC - Secret-Key Encryption Implementation
 *
 * Implements `IMessageEncryption` using a caller-supplied symmetric secret key.
 * All encryption is performed with AES-256-GCM (authenticated encryption).
 *
 * ## Key requirements
 * - The secret key must be **exactly 32 bytes** (256 bits).
 * - A new random 12-byte IV is generated for every encryption operation.
 * - The 128-bit GCM authentication tag is verified before any plaintext
 *   is returned from decryption calls.
 *
 * ## Key derivation (optional)
 * If you have a human-readable passphrase rather than a raw key, derive one
 * with PBKDF2 or scrypt before passing it here:
 *
 * ```typescript
 * const key = crypto.scryptSync(passphrase, salt, 32);
 * const enc = new SecretKeyEncryption({ secretKey: key });
 * ```
 *
 * ## Key rotation
 * Supply a `keyId` in the options so that every `EncryptedData` envelope
 * records which key was used. When rotating keys, provide a `decryptionKeys`
 * map so that old ciphertexts can still be decrypted:
 *
 * ```typescript
 * const enc = new SecretKeyEncryption({
 *   secretKey: newKey,
 *   keyId: "v2",
 *   decryptionKeys: { v1: oldKey },
 * });
 * ```
 *
 * @module implementations/encryption/secret-key
 */

import crypto from "node:crypto";
import type { MessageAttachment, StoredMessage, AttachmentMetadata } from "../../index.js";
import type {
  IMessageEncryption,
  EncryptedAttachmentContent,
} from "../../protocol/encryption/interface.js";
import type {
  EncryptedData,
  EncryptedStoredMessage,
  EncryptedAttachmentMetadata,
  EncryptedMessagePayload,
  EncryptedAttachmentMetadataPayload,
  EncryptionContext,
} from "../../protocol/encryption/types.js";

// ============================================================================
// Constants
// ============================================================================

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH_BYTES = 12; // 96-bit nonce — recommended for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag
const KEY_LENGTH_BYTES = 32; // AES-256 requires a 32-byte key

// ============================================================================
// Options
// ============================================================================

/**
 * Configuration for `SecretKeyEncryption`.
 */
export interface SecretKeyEncryptionOptions {
  /**
   * The primary encryption key — must be exactly 32 bytes.
   * Can be a `Buffer`, a hex string (64 hex chars), or a base64 string
   * (44 chars for a 32-byte payload).
   */
  secretKey: Buffer | string;

  /**
   * Optional identifier for the primary key.
   * Written into every `EncryptedData` envelope so that the correct
   * decryption key can be looked up when rotating keys.
   *
   * @default "default"
   */
  keyId?: string;

  /**
   * Optional map of historic key IDs to their key material.
   * Used to decrypt envelopes that were encrypted with a previous key.
   *
   * @example
   * { "v1": Buffer.from("...old 32-byte key...") }
   */
  decryptionKeys?: Record<string, Buffer | string>;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Symmetric-key encryption backend for MPRC messages and attachments.
 *
 * Uses AES-256-GCM for all encryption/decryption. Supports optional key
 * rotation via `decryptionKeys`.
 *
 * @example
 * ```typescript
 * // Generate a random 32-byte key
 * const secretKey = crypto.randomBytes(32);
 *
 * const encryption = new SecretKeyEncryption({ secretKey, keyId: "v1" });
 *
 * // Encrypt a stored message before persisting
 * const encryptedMsg = await encryption.encryptMessage(storedMessage);
 *
 * // Decrypt when serving to the client
 * const plainMsg = await encryption.decryptMessage(encryptedMsg);
 * ```
 */
export class SecretKeyEncryption implements IMessageEncryption {
  private readonly primaryKey: Buffer;
  private readonly keyId: string;
  private readonly decryptionKeys: Map<string, Buffer>;

  constructor(options: SecretKeyEncryptionOptions) {
    this.primaryKey = SecretKeyEncryption.resolveKey(options.secretKey);
    this.keyId = options.keyId ?? "default";

    if (this.primaryKey.length !== KEY_LENGTH_BYTES) {
      throw new Error(
        `SecretKeyEncryption: secret key must be ${KEY_LENGTH_BYTES} bytes, ` +
          `got ${this.primaryKey.length} bytes.`,
      );
    }

    // Build decryption key map (includes the primary key under its own ID)
    this.decryptionKeys = new Map<string, Buffer>();
    this.decryptionKeys.set(this.keyId, this.primaryKey);

    for (const [id, raw] of Object.entries(options.decryptionKeys ?? {})) {
      this.decryptionKeys.set(id, SecretKeyEncryption.resolveKey(raw));
    }
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  /**
   * Normalises a key supplied as a `Buffer`, hex string, or base64 string
   * into a `Buffer`.
   */
  private static resolveKey(raw: Buffer | string): Buffer {
    if (Buffer.isBuffer(raw)) {
      return raw;
    }
    // 64 hex chars → 32 bytes
    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      return Buffer.from(raw, "hex");
    }
    // Otherwise assume base64
    return Buffer.from(raw, "base64");
  }

  /**
   * Returns the decryption key for the given key ID.
   * Falls back to the primary key if the ID is not found and only one
   * key is registered (backward-compat for envelopes without `keyId`).
   */
  private resolveDecryptionKey(keyId?: string): Buffer {
    if (!keyId) {
      return this.primaryKey;
    }
    const key = this.decryptionKeys.get(keyId);
    if (!key) {
      throw new Error(
        `SecretKeyEncryption: no decryption key found for keyId "${keyId}". ` +
          `Register historic keys via the \`decryptionKeys\` option.`,
      );
    }
    return key;
  }

  /**
   * Builds the Additional Authenticated Data (AAD) bytes from an optional
   * `EncryptionContext`. AAD binds the ciphertext to its context so that it
   * cannot be replayed in a different context.
   */
  private static buildAAD(context?: EncryptionContext): Buffer {
    if (!context) {
      return Buffer.alloc(0);
    }
    const parts: string[] = [];
    if (context.entityId) parts.push(`entityId=${context.entityId}`);
    if (context.entityType) parts.push(`entityType=${context.entityType}`);
    if (context.userId) parts.push(`userId=${context.userId}`);
    return Buffer.from(parts.join("|"), "utf8");
  }

  // --------------------------------------------------------------------------
  // Low-level AES-256-GCM primitives
  // --------------------------------------------------------------------------

  /**
   * Encrypts a `Buffer` with AES-256-GCM and returns the raw components.
   */
  private encryptBuffer(
    plaintext: Buffer,
    key: Buffer,
    aad: Buffer,
  ): { iv: Buffer; ciphertext: Buffer; authTag: Buffer } {
    const iv = crypto.randomBytes(IV_LENGTH_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });

    if (aad.length > 0) {
      cipher.setAAD(aad);
    }

    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { iv, ciphertext, authTag };
  }

  /**
   * Decrypts a `Buffer` with AES-256-GCM. Throws if the auth tag is invalid.
   */
  private decryptBuffer(
    ciphertext: Buffer,
    key: Buffer,
    iv: Buffer,
    authTag: Buffer,
    aad: Buffer,
  ): Buffer {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH_BYTES,
    });

    decipher.setAuthTag(authTag);

    if (aad.length > 0) {
      decipher.setAAD(aad);
    }

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
      throw new Error(
        "SecretKeyEncryption: decryption failed — ciphertext may have been " +
          "tampered with, or the wrong key / context was supplied.",
      );
    }
  }

  /**
   * Builds an `EncryptedData` envelope from raw cipher components.
   */
  private buildEnvelope(
    iv: Buffer,
    ciphertext: Buffer,
    authTag: Buffer,
    context?: EncryptionContext,
  ): EncryptedData {
    return {
      algorithm: ALGORITHM,
      iv: iv.toString("base64"),
      ciphertext: ciphertext.toString("base64"),
      authTag: authTag.toString("base64"),
      keyId: this.keyId,
      ...(context?.entityType !== undefined ? { aadContext: context.entityType } : {}),
    };
  }

  /**
   * Deconstructs an `EncryptedData` envelope into raw buffers and
   * selects the appropriate decryption key.
   */
  private unpackEnvelope(envelope: EncryptedData): {
    key: Buffer;
    iv: Buffer;
    ciphertext: Buffer;
    authTag: Buffer;
  } {
    if (envelope.algorithm !== ALGORITHM) {
      throw new Error(
        `SecretKeyEncryption: unsupported algorithm "${envelope.algorithm}". ` +
          `This implementation only supports "${ALGORITHM}".`,
      );
    }

    return {
      key: this.resolveDecryptionKey(envelope.keyId),
      iv: Buffer.from(envelope.iv, "base64"),
      ciphertext: Buffer.from(envelope.ciphertext, "base64"),
      authTag: Buffer.from(envelope.authTag, "base64"),
    };
  }

  // --------------------------------------------------------------------------
  // IMessageEncryption — low-level primitives
  // --------------------------------------------------------------------------

  async encryptString(plaintext: string, context?: EncryptionContext): Promise<EncryptedData> {
    const aad = SecretKeyEncryption.buildAAD(context);
    const { iv, ciphertext, authTag } = this.encryptBuffer(
      Buffer.from(plaintext, "utf8"),
      this.primaryKey,
      aad,
    );
    return this.buildEnvelope(iv, ciphertext, authTag, context);
  }

  async decryptString(encrypted: EncryptedData, context?: EncryptionContext): Promise<string> {
    const { key, iv, ciphertext, authTag } = this.unpackEnvelope(encrypted);
    const aad = SecretKeyEncryption.buildAAD(context);
    const plaintext = this.decryptBuffer(ciphertext, key, iv, authTag, aad);
    return plaintext.toString("utf8");
  }

  async encryptBinary(base64Data: string, context?: EncryptionContext): Promise<EncryptedData> {
    const aad = SecretKeyEncryption.buildAAD(context);
    const { iv, ciphertext, authTag } = this.encryptBuffer(
      Buffer.from(base64Data, "base64"),
      this.primaryKey,
      aad,
    );
    return this.buildEnvelope(iv, ciphertext, authTag, context);
  }

  async decryptBinary(encrypted: EncryptedData, context?: EncryptionContext): Promise<string> {
    const { key, iv, ciphertext, authTag } = this.unpackEnvelope(encrypted);
    const aad = SecretKeyEncryption.buildAAD(context);
    const plaintext = this.decryptBuffer(ciphertext, key, iv, authTag, aad);
    return plaintext.toString("base64");
  }

  // --------------------------------------------------------------------------
  // IMessageEncryption — message-level operations
  // --------------------------------------------------------------------------

  async encryptMessage(message: StoredMessage): Promise<EncryptedStoredMessage> {
    const context: EncryptionContext = {
      entityId: message.id,
      entityType: "message-payload",
    };

    // Serialise sensitive fields into a single JSON payload
    const payload: EncryptedMessagePayload = {
      subject: message.subject,
      body: message.body,
      ...(message.sentAt !== undefined ? { sentAt: message.sentAt } : {}),
      ...(message.responseTo !== undefined ? { responseTo: message.responseTo } : {}),
      ...(message.tags !== undefined ? { tags: message.tags } : {}),
      ...(message.folder !== undefined ? { folder: message.folder } : {}),
    };

    const encryptedPayload = await this.encryptString(JSON.stringify(payload), context);

    // Encrypt attachment metadata if present (content blobs are handled separately)
    let encryptedAttachments: EncryptedAttachmentMetadata[] | undefined;

    if (message.attachments && message.attachments.length > 0) {
      encryptedAttachments = await Promise.all(
        message.attachments.map((att) =>
          this.encryptAttachmentMetadata(
            {
              id: att.id,
              filename: att.filename,
              ...(att.mimeType !== undefined ? { mimeType: att.mimeType } : {}),
            },
            att.contentHash,
            att.size,
          ),
        ),
      );
    }

    return {
      id: message.id,
      from: message.from,
      to: message.to,
      ...(message.receivedAt !== undefined ? { receivedAt: message.receivedAt } : {}),
      isEncrypted: true,
      encryptedPayload,
      ...(encryptedAttachments !== undefined ? { attachments: encryptedAttachments } : {}),
    };
  }

  async decryptMessage(message: EncryptedStoredMessage): Promise<StoredMessage> {
    const context: EncryptionContext = {
      entityId: message.id,
      entityType: "message-payload",
    };

    const payloadJson = await this.decryptString(message.encryptedPayload, context);
    const payload = JSON.parse(payloadJson) as EncryptedMessagePayload;

    // Decrypt attachment metadata if present
    let attachments: AttachmentMetadata[] | undefined;

    if (message.attachments && message.attachments.length > 0) {
      attachments = await Promise.all(
        message.attachments.map(async (att) => {
          const plain = await this.decryptAttachmentMetadata(att);
          return {
            id: plain.id,
            filename: plain.filename,
            contentHash: plain.contentHash,
            size: plain.size,
            mimeType: plain.mimeType,
          } satisfies AttachmentMetadata;
        }),
      );
    }

    return {
      id: message.id,
      from: message.from,
      to: message.to,
      subject: payload.subject,
      body: payload.body,
      ...(message.receivedAt !== undefined ? { receivedAt: message.receivedAt } : {}),
      ...(payload.sentAt !== undefined ? { sentAt: new Date(payload.sentAt) } : {}),
      ...(payload.responseTo !== undefined ? { responseTo: payload.responseTo } : {}),
      ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
      ...(payload.folder !== undefined ? { folder: payload.folder } : {}),
      ...(attachments !== undefined ? { attachments } : {}),
    };
  }

  // --------------------------------------------------------------------------
  // IMessageEncryption — attachment-level operations
  // --------------------------------------------------------------------------

  async encryptAttachmentMetadata(
    attachment: Pick<MessageAttachment, "id" | "filename" | "mimeType">,
    contentHash: string,
    size: number,
  ): Promise<EncryptedAttachmentMetadata> {
    const context: EncryptionContext = {
      entityId: attachment.id,
      entityType: "attachment-metadata",
    };

    const metadataPayload: EncryptedAttachmentMetadataPayload = {
      filename: attachment.filename,
      mimeType: attachment.mimeType ?? "application/octet-stream",
    };

    const encryptedMetadata = await this.encryptString(
      JSON.stringify(metadataPayload),
      context,
    );

    return {
      id: attachment.id,
      contentHash,
      size,
      encryptedMetadata,
      contentEncrypted: false, // metadata-only encryption; content not yet encrypted
    };
  }

  async decryptAttachmentMetadata(encrypted: EncryptedAttachmentMetadata): Promise<{
    id: string;
    filename: string;
    mimeType: string;
    contentHash: string;
    size: number;
  }> {
    const context: EncryptionContext = {
      entityId: encrypted.id,
      entityType: "attachment-metadata",
    };

    const json = await this.decryptString(encrypted.encryptedMetadata, context);
    const payload = JSON.parse(json) as EncryptedAttachmentMetadataPayload;

    return {
      id: encrypted.id,
      filename: payload.filename,
      mimeType: payload.mimeType,
      contentHash: encrypted.contentHash,
      size: encrypted.size,
    };
  }

  async encryptAttachmentContent(
    attachment: MessageAttachment,
    contentHash: string,
  ): Promise<EncryptedAttachmentContent> {
    const context: EncryptionContext = {
      entityId: attachment.id,
      entityType: "attachment-content",
    };

    // Encrypt the binary content
    const encryptedContentEnvelope = await this.encryptBinary(attachment.content, context);

    // Re-encode the encrypted envelope as base64 for storage
    // (the storage layer expects a base64 string in the content field)
    const encryptedContentBase64 = Buffer.from(
      JSON.stringify(encryptedContentEnvelope),
      "utf8",
    ).toString("base64");

    const metadata = await this.encryptAttachmentMetadata(
      {
        id: attachment.id,
        filename: attachment.filename,
        ...(attachment.mimeType !== undefined ? { mimeType: attachment.mimeType } : {}),
      },
      contentHash,
      attachment.size ?? Buffer.byteLength(attachment.content, "base64"),
    );

    // Mark content as encrypted
    const encryptedMetadata: EncryptedAttachmentMetadata = {
      ...metadata,
      contentEncrypted: true,
    };

    return {
      encryptedAttachment: {
        id: attachment.id,
        filename: attachment.filename,
        content: encryptedContentBase64,
        ...(attachment.mimeType !== undefined ? { mimeType: attachment.mimeType } : {}),
        ...(attachment.size !== undefined ? { size: attachment.size } : {}),
      },
      metadata: encryptedMetadata,
    };
  }

  async decryptAttachmentContent(
    encryptedContent: string,
    _metadata: EncryptedAttachmentMetadata,
  ): Promise<string> {
    // Decode the JSON envelope that was base64-encoded during encryption
    const envelopeJson = Buffer.from(encryptedContent, "base64").toString("utf8");
    const envelope = JSON.parse(envelopeJson) as EncryptedData;

    const context: EncryptionContext = {
      entityId: _metadata.id,
      entityType: "attachment-content",
    };

    return this.decryptBinary(envelope, context);
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  describe(): string {
    return `SecretKeyEncryption(${ALGORITHM}, keyId=${this.keyId}, knownKeys=[${[...this.decryptionKeys.keys()].join(", ")}])`;
  }
}

// ============================================================================
// Factory helpers
// ============================================================================

/**
 * Creates a `SecretKeyEncryption` instance from a raw hex or base64 key string.
 *
 * @example
 * ```typescript
 * const enc = createSecretKeyEncryption(process.env.ENCRYPTION_KEY!);
 * ```
 */
export function createSecretKeyEncryption(
  secretKey: string | Buffer,
  options?: Omit<SecretKeyEncryptionOptions, "secretKey">,
): SecretKeyEncryption {
  return new SecretKeyEncryption({ secretKey, ...options });
}

/**
 * Generates a cryptographically random 32-byte key suitable for
 * `SecretKeyEncryption`, returned as a hex string.
 *
 * Store the result securely (e.g., in a secrets manager or environment
 * variable). **Never commit it to source control.**
 *
 * @example
 * ```typescript
 * const key = generateSecretKey();
 * console.log(key); // 64 hex characters
 * // Store in environment: ENCRYPTION_KEY=<hex>
 * ```
 */
export function generateSecretKey(): string {
  return crypto.randomBytes(KEY_LENGTH_BYTES).toString("hex");
}
