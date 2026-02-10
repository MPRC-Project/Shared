export {
  FilesystemAttachmentStorage,
  createDefaultAttachmentStorage,
} from "./attachment/memory.js";
export type { FilesystemStorageOptions } from "./attachment/memory.js";

export {
  InMemoryDatabase,
  createDefaultDatabase,
} from "./mail-database/memory.js";
