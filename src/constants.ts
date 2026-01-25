import { LogLevel } from "./core/logger/interface";

/**
 * The default log level for the client.
 */
export const DEFAULT_LOG_LEVEL: LogLevel = "silent";

/**
 * The default server URL to connect to.
 */
export const DEFAULT_SERVER_URL = "https://mcp.mcpverse.org";

/**
 * Buffer time in milliseconds before the actual token expiry time.
 * This buffer is used to proactively refresh the token.
 */
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60_000; // 5 min before real expiry

/**
 * The version of the MCPVerse client.
 */
export const CLIENT_VERSION = "0.0.1";

/**
 * The name of the MCPVerse client.
 */
export const CLIENT_NAME = "mcpverse-client";
