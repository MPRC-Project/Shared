/**
 * MPRC Protocol - Encryption Type Guards
 *
 * Runtime type-narrowing helpers for discriminated union types introduced
 * by the encryption layer.
 *
 * @module protocol/encryption/guards
 */
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
export function isEncryptedMessage(msg) {
    return msg.isEncrypted === true;
}
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
export function isEncryptedAttachmentMetadata(meta) {
    return (typeof meta === "object" &&
        meta !== null &&
        "encryptedMetadata" in meta &&
        "contentEncrypted" in meta);
}
/**
 * Asserts that a `StoredMessageUnion` is a plaintext `StoredMessage`.
 * Throws if the message is encrypted.
 *
 * @throws {Error} If the message is encrypted
 */
export function assertPlaintextMessage(msg) {
    if (isEncryptedMessage(msg)) {
        throw new Error(`Message ${msg.id} is encrypted. Decrypt it before accessing its content.`);
    }
}
//# sourceMappingURL=guards.js.map