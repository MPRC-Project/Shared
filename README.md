# @mprc/shared

Shared utilities, types, and protocol definitions for the MPRC (Mail Protocol Reference Client) ecosystem.

## Overview

This package provides the common foundation used by both `@mprc/client` and `@mprc/server`. It includes:

- **Protocol Types**: Core TypeScript interfaces for messages, users, commands, and responses
- **Network Utilities**: TCP connection handling, DNS resolution for mail servers
- **Error Classes**: Typed error hierarchy for consistent error handling
- **Constants**: Protocol version, default ports, and configuration values
- **Message Body**: Structured message format as an alternative to HTML

## Installation

```bash
npm install @mprc/shared
```

## Usage

### Importing Types

```typescript
import {
  type Message,
  type User,
  type MessageBody,
  type MPRCCommand,
  type MPRCCommandResponse,
} from "@mprc/shared";

// Create a message
const message: Message = {
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello!",
  body: [
    { type: "h1", content: "Welcome" },
    { type: "p", content: "This is a structured message body." },
  ],
};
```

### Using Protocol Constants

```typescript
import {
  MPRC_PORT,
  MPRC_PROTOCOL_VERSION,
  MPRC_PROTOCOL_IDENTIFIER,
} from "@mprc/shared";

console.log(`MPRC Protocol v${MPRC_PROTOCOL_VERSION}`);
console.log(`Default port: ${MPRC_PORT}`);
```

### Network Utilities

```typescript
import {
  MPRCConnection,
  resolveEmailToServerAddress,
  sendSingleCommand,
  createVerifyCommand,
} from "@mprc/shared";

// Resolve email domain to MPRC server
const serverHost = await resolveEmailToServerAddress("user@example.com");
// Returns: "mail.example.com" or similar

// Send a single command
const command = createVerifyCommand();
const response = await sendSingleCommand(serverHost, command);

// Or use the connection class for multiple commands
const connection = new MPRCConnection(serverHost);
await connection.connect();
const result = await connection.sendCommand(command);
await connection.disconnect();
```

### Error Handling

```typescript
import {
  MPRCError,
  ConnectionError,
  NetworkError,
  InvalidEmailError,
  UserNotFoundError,
  SenderVerificationError,
} from "@mprc/shared";

try {
  await sendMessage(message);
} catch (error) {
  if (error instanceof UserNotFoundError) {
    console.error(`Recipient not found: ${error.email}`);
  } else if (error instanceof ConnectionError) {
    console.error(`Could not connect: ${error.message}`);
  } else if (error instanceof MPRCError) {
    console.error(`MPRC error [${error.code}]: ${error.message}`);
  }
}
```

### Structured Message Bodies

MPRC uses a structured message body format instead of raw HTML for security and consistency:

```typescript
import type { MessageBody, BodyElement } from "@mprc/shared";
import { renderMessageBodyToHtml } from "@mprc/shared/protocol";

const body: MessageBody = [
  { type: "h1", content: "Welcome to MPRC" },
  { type: "p", content: "This is a paragraph with some text." },
  {
    type: "div",
    children: [
      { type: "p", content: "Nested content is supported." },
      {
        type: "ul",
        children: [
          { type: "li", content: "Item 1" },
          { type: "li", content: "Item 2" },
          { type: "li", content: "Item 3" },
        ],
      },
    ],
  },
  {
    type: "a",
    content: "Click here",
    href: "https://example.com",
  },
];

// Convert to HTML for rendering
const html = renderMessageBodyToHtml(body);
```

### Type Guards

```typescript
import {
  isMPRCCommand,
  isVerifyCommand,
  isFindUserCommand,
  isSendMessageCommand,
  isListMessagesCommand,
} from "@mprc/shared";

function handleCommand(data: unknown) {
  if (!isMPRCCommand(data)) {
    throw new Error("Invalid command format");
  }

  if (isVerifyCommand(data)) {
    // Handle VERIFY command
  } else if (isSendMessageCommand(data)) {
    // Handle SEND_MESSAGE command
  }
}
```

## API Reference

### Types

#### Message

```typescript
interface Message {
  id?: string;
  from: string;
  to: string;
  subject: string;
  body: MessageBody;
  folder?: string;
  tags?: string[];
  receivedAt?: Date;
}
```

#### User

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
}
```

#### Commands

| Command | Description |
|---------|-------------|
| `VERIFY` | Verify server supports MPRC protocol |
| `FIND_USER` | Check if a user exists |
| `SEND_MESSAGE` | Send a message to a recipient |
| `LIST_MESSAGES` | List messages in a user's mailbox |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MPRC_PORT` | `14720` | Default MPRC protocol port |
| `MPRC_PROTOCOL_VERSION` | `"1.0"` | Protocol version |
| `MPRC_PROTOCOL_IDENTIFIER` | `"MPRC"` | Protocol identifier string |

### Errors

| Error Class | Code | Description |
|-------------|------|-------------|
| `MPRCError` | - | Base class for all MPRC errors |
| `ConnectionError` | `CONNECTION_ERROR` | Failed to connect to server |
| `NetworkError` | `NETWORK_ERROR` | Network-related failures |
| `TimeoutError` | `TIMEOUT_ERROR` | Operation timed out |
| `InvalidJsonError` | `INVALID_JSON` | Received invalid JSON |
| `InvalidCommandError` | `INVALID_COMMAND` | Command format is invalid |
| `UnknownCommandError` | `UNKNOWN_COMMAND` | Unrecognized command type |
| `InvalidEmailError` | `INVALID_EMAIL` | Email format is invalid |
| `UserNotFoundError` | `USER_NOT_FOUND` | User does not exist |
| `SenderVerificationError` | `SENDER_VERIFICATION_FAILED` | Could not verify sender |

## Module Exports

The package provides multiple entry points:

```typescript
// Main entry point - all exports
import { ... } from "@mprc/shared";

// Protocol-specific exports
import { ... } from "@mprc/shared/protocol";

// Network utilities
import { ... } from "@mprc/shared/network";
```

## Requirements

- Node.js >= 18.0.0
- TypeScript 5.0+ (for type definitions)

## License

MIT
