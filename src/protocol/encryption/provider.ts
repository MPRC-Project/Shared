import type {
  Message,
  MessageAttachment,
  AttachmentMetadata,
} from "../index.js";
import type {
  EncryptionMethod,
  EncryptedMessage,
  EncryptedMessageAttachment,
  EncryptedAttachmentMetadata,
} from "./types.js";

export interface IEncryptionProvider {
  readonly method: EncryptionMethod;

  /**
   * Encrypts a message. Routing fields (id, from, to, receivedAt) are kept
   * in plaintext. Everything else (subject, body, sentAt, tags, folder,
   * responseTo) is encrypted into the payload.
   *
   * Attachment content is NOT encrypted here — use encryptAttachment separately.
   */
  encryptMessage(message: Message): Promise<EncryptedMessage>;

  /**
   * Decrypts a message. Returns a Message with all sensitive fields restored.
   * The returned message will NOT have attachments populated — the caller is
   * responsible for reattaching attachment metadata from EncryptedStoredMessage.
   */
  decryptMessage(encrypted: EncryptedMessage): Promise<Message>;

  /**
   * Encrypts attachment content. Returns an EncryptedMessageAttachment whose
   * encryptedContent can be serialized and stored in attachment storage.
   */
  encryptAttachment(
    attachment: MessageAttachment,
  ): Promise<EncryptedMessageAttachment>;

  /**
   * Decrypts attachment content.
   */
  decryptAttachment(
    encrypted: EncryptedMessageAttachment,
  ): Promise<MessageAttachment>;

  /**
   * Promotes plain AttachmentMetadata to EncryptedAttachmentMetadata by
   * recording the encryption method and key identifier used when the
   * attachment content was encrypted.
   */
  tagAttachmentMetadata(
    metadata: AttachmentMetadata,
  ): EncryptedAttachmentMetadata;
}
