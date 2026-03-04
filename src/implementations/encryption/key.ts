import type {
  Message,
  MessageAttachment,
  AttachmentMetadata,
  MessageSensitivePayload,
} from "../../protocol/index.js";
import type { IEncryptionProvider } from "../../protocol/encryption/provider.js";
import type {
  EncryptedMessage,
  EncryptedMessageAttachment,
  EncryptedAttachmentMetadata,
} from "../../protocol/encryption/types.js";
import {
  symmetricEncrypt,
  symmetricDecrypt,
  resolveKeyBuffer,
} from "./utils.js";

export interface EncryptionKeyOptions {
  encryptionKey: string | Buffer;
}

export class EncryptionKeyEncryptionProvider implements IEncryptionProvider {
  readonly method = "EncryptionKey" as const;
  private readonly key: Buffer;

  constructor(options: EncryptionKeyOptions) {
    this.key = resolveKeyBuffer(options.encryptionKey);
  }

  async encryptMessage(message: Message): Promise<EncryptedMessage> {
    const sensitive: MessageSensitivePayload = {
      subject: message.subject,
      body: message.body,
      sentAt: message.sentAt,
      responseTo: message.responseTo,
      tags: message.tags,
      folder: message.folder,
    };

    return {
      __encrypted: true,
      encryptionMethod: "EncryptionKey",
      id: message.id,
      from: message.from,
      to: message.to,
      receivedAt: message.receivedAt,
      encryptedPayload: symmetricEncrypt(JSON.stringify(sensitive), this.key),
    };
  }

  async decryptMessage(encrypted: EncryptedMessage): Promise<Message> {
    const json = symmetricDecrypt(encrypted.encryptedPayload, this.key);
    const sensitive = JSON.parse(json) as MessageSensitivePayload;

    return {
      id: encrypted.id,
      from: encrypted.from,
      to: encrypted.to,
      receivedAt: encrypted.receivedAt,
      subject: sensitive.subject,
      body: sensitive.body,
      sentAt: sensitive.sentAt,
      responseTo: sensitive.responseTo,
      tags: sensitive.tags,
      folder: sensitive.folder,
    };
  }

  async encryptAttachment(
    attachment: MessageAttachment,
  ): Promise<EncryptedMessageAttachment> {
    return {
      __encrypted: true,
      encryptionMethod: "EncryptionKey",
      id: attachment.id,
      filename: attachment.filename,
      encryptedContent: symmetricEncrypt(attachment.content, this.key),
      size: attachment.size,
      mimeType: attachment.mimeType,
    };
  }

  async decryptAttachment(
    encrypted: EncryptedMessageAttachment,
  ): Promise<MessageAttachment> {
    return {
      id: encrypted.id,
      filename: encrypted.filename,
      content: symmetricDecrypt(encrypted.encryptedContent, this.key),
      size: encrypted.size,
      mimeType: encrypted.mimeType,
    };
  }

  tagAttachmentMetadata(
    metadata: AttachmentMetadata,
  ): EncryptedAttachmentMetadata {
    return {
      ...metadata,
      __encrypted: true,
      encryptionMethod: "EncryptionKey",
    };
  }
}

export function createEncryptionKeyProvider(
  encryptionKey: string | Buffer,
): EncryptionKeyEncryptionProvider {
  return new EncryptionKeyEncryptionProvider({ encryptionKey });
}
