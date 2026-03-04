import crypto from "node:crypto";
import type { EncryptedPayload } from "../../protocol/encryption/types.js";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

export function symmetricEncrypt(
  plaintext: string,
  key: Buffer,
): EncryptedPayload {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_BYTES,
  });
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function symmetricDecrypt(
  payload: EncryptedPayload,
  key: Buffer,
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, "base64"),
    { authTagLength: AUTH_TAG_BYTES },
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/**
 * Serialises an EncryptedPayload into a base64 string suitable for passing
 * to IAttachmentStorage (which expects base64-encoded binary content).
 */
export function serializePayloadForStorage(payload: EncryptedPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

/**
 * Deserialises an EncryptedPayload from the base64 string returned by
 * IAttachmentStorage.retrieveAttachment.
 */
export function deserializePayloadFromStorage(
  base64: string,
): EncryptedPayload {
  return JSON.parse(
    Buffer.from(base64, "base64").toString("utf8"),
  ) as EncryptedPayload;
}

export function resolveKeyBuffer(key: string | Buffer): Buffer {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `Encryption key must be exactly ${KEY_BYTES} bytes, received ${key.length}`,
      );
    }
    return key;
  }
  const buf = Buffer.from(key, "hex");
  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `Encryption key hex string must represent ${KEY_BYTES} bytes, received ${buf.length}`,
    );
  }
  return buf;
}
