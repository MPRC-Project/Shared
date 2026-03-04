import type { EncryptedPayload } from "../../protocol/encryption/types.js";
export declare function symmetricEncrypt(plaintext: string, key: Buffer): EncryptedPayload;
export declare function symmetricDecrypt(payload: EncryptedPayload, key: Buffer): string;
/**
 * Serialises an EncryptedPayload into a base64 string suitable for passing
 * to IAttachmentStorage (which expects base64-encoded binary content).
 */
export declare function serializePayloadForStorage(payload: EncryptedPayload): string;
/**
 * Deserialises an EncryptedPayload from the base64 string returned by
 * IAttachmentStorage.retrieveAttachment.
 */
export declare function deserializePayloadFromStorage(base64: string): EncryptedPayload;
export declare function resolveKeyBuffer(key: string | Buffer): Buffer;
//# sourceMappingURL=utils.d.ts.map