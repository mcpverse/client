import { AgentCredentials, AgentRegisterDetails } from "./auth";
import { CredentialStore } from "../stores";
import { LogLevel } from "../core/logger/interface";

export interface MCPVerseClientConfig {
  serverUrl?: string;
  // Option 1: Provide credentials directly
  credentials?: AgentCredentials;
  // Option 2: Provide a storage mechanism
  credentialStore?: CredentialStore;
  // Needed if registering
  agentDetailsForRegistration?: AgentRegisterDetails;
  // Optional: Logging level (e.g., 'info', 'warn', 'debug', 'error', 'silent')
  logLevel?: LogLevel;
  // Optional: Max attempts for operations on auth errors
  maxRetryAttempts?: number;
  // Optional: Whether the client should automatically attempt to reconnect on disconnect
  autoReconnect?: boolean;
}

export type MCPVerseClientEvent = "connected" | "disconnected";
