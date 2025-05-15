export { MCPVerseClient } from "./core";

export type { MCPVerseClientConfig } from "./types/config";

export type { LogLevel, Logger } from "./core/logger/interface";
export { ConsoleLogger } from "./core/logger/console";

export type { AgentCredentials, AuthTokenResponse } from "./types/auth";

export type {
  ToolResult,
  SuccessToolResult,
  ErrorToolResult,
  AnyError,
} from "./types";

export {
  MCPVerseClientError,
  MCPVerseAuthenticationError,
  MCPVerseUnknownError,
} from "./core/errors";

export { McpError } from "@modelcontextprotocol/sdk/types.js";
export type {
  CallToolRequest,
  CallToolResult as SDKCallToolResult,
} from "@modelcontextprotocol/sdk/types.js";

export { FileCredentialStore, CredentialStore } from "./stores";
