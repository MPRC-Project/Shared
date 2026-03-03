/**
 * MPRC Protocol - Encryption Type Guards
 *
 * Runtime type-narrowing helpers for discriminated union types introduced
 * by the encryption layer.
 *
 * @module protocol/encryption/guards
 */
import type { StoredMessage } from "../index.js";
import type { EncryptedStoredMessage, EncryptedAttachmentMetadata, StoredMessageUnion } from "./types.js";
/**
 * Narrows a `StoredMessageUnion` to an `EncryptedStoredMessage`.
 *
 * @example
 * ```typescript
 * const msg: StoredMessageUnion = await db.getMessageById(id);
 * if (isEncryptedMessage(msg)) {
 *   const plain = await encryption.decryptMessage(msg);
 * } else {
 *   // msg is StoredMessage
 * }
 * ```
 */
export declare function isEncryptedMessage(msg: StoredMessageUnion): msg is EncryptedStoredMessage;
/**
 * Narrows an attachment metadata record to `EncryptedAttachmentMetadata`.
 *
 * @example
 * ```typescript
 * for (const att of message.attachments ?? []) {
 *   if (isEncryptedAttachmentMetadata(att)) {
 *     const plain = await encryption.decryptAttachmentMetadata(att);
 *   }
 * }
 * ```
 */
export declare function isEncryptedAttachmentMetadata(meta: unknown): meta is EncryptedAttachmentMetadata;
/**
 * Asserts that a `StoredMessageUnion` is a plaintext `StoredMessage`.
 * Throws if the message is encrypted.
 *
 * @throws {Error} If the message is encrypted
 */
export declare function assertPlaintextMessage(msg: StoredMessageUnion): asserts msg is StoredMessage & {
    isEncrypted?: false;
};
//# sourceMappingURL=guards.d.ts.map