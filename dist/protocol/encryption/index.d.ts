/**
 * MPRC Protocol - Encryption Module
 *
 * Exports all encryption-related types and the `IMessageEncryption` interface.
 * Import concrete implementations from `../../implementations/encryption/`.
 *
 * @module protocol/encryption
 */
export type { EncryptionAlgorithm, EncryptedData, EncryptedAttachmentMetadata, EncryptedAttachmentMetadataPayload, EncryptedStoredMessage, EncryptedMessagePayload, StoredMessageUnion, AttachmentMetadataUnion, EncryptionContext, } from "./types.js";
export type { IMessageEncryption, EncryptedAttachmentContent } from "./interface.js";
export { isEncryptedMessage, isEncryptedAttachmentMetadata } from "./guards.js";
//# sourceMappingURL=index.d.ts.map