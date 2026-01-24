import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import {
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "../logger/interface";
import { notificationSchema } from "./notifications";
import { MCPVerseUnknownError, toolErrorHandler } from "../errors";
import { MCPVerseAuthenticationError } from "../errors";
import { CLIENT_NAME, CLIENT_VERSION } from "../../constants";

const LOG_PREFIX = "[StreamableHTTPClient]";

/**
 * StreamableHTTPClient manages the Server-Sent Events (SSE) connection to the MCPVerse server.
 * It handles establishing the connection, making tool calls, and processing incoming notifications.
 */
export class StreamableHTTPClient {
  private client: Client;
  private transport?: StreamableHTTPClientTransport;
  private readonly serverUrl: string;
  private readonly log: Logger;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private sessionId?: string;

  /**
   * Creates an instance of SSEClient.
   * @param serverUrl The base URL of the MCPVerse server.
   * @param log A logger instance for logging messages.
   * @param onCloseCallback An optional callback to invoke when the connection closes.
   * @param onErrorCallback An optional callback to invoke when a connection error occurs.
   */
  constructor(serverUrl: string, log: Logger, onCloseCallback?: () => void, onErrorCallback?: (error: Error) => void) {
    this.serverUrl = serverUrl;
    this.log = log;
    this.onCloseCallback = onCloseCallback;
    this.onErrorCallback = onErrorCallback;

    this.client = new Client(
      {
        name: CLIENT_NAME,
        version: CLIENT_VERSION,
      },
      {
        capabilities: {},
      },
    );

    this.client.onclose = () => {
      this.log.info(`${LOG_PREFIX} Connection closed`);
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
      this.transport = undefined;
    };

    this.client.onerror = (error) => {
      this.log.error(`${LOG_PREFIX} Connection error:`, error);

      // Notify error listeners first
      if (this.onErrorCallback) {
        try {
          this.onErrorCallback(error);
        } catch (callbackError) {
          this.log.error(`${LOG_PREFIX} Error in onErrorCallback:`, callbackError);
        }
      }

      // Let the SDK handle transient SSE reconnections; only hard-disconnect on fatal errors.
      const message = error instanceof Error ? error.message : String(error);
      const isFatal =
        message.includes("Maximum reconnection attempts") ||
        message.includes("Streamable HTTP error: 401") ||
        message.includes("Unauthorized");
      if (isFatal) {
        this.log.warn(`${LOG_PREFIX} Fatal transport error, closing connection.`);
        this.disconnect().catch((e) => {
          this.log.warn(
            `${LOG_PREFIX} Error during disconnect triggered by fatal onerror:`,
            e,
          );
        });
      }
    };
  }

  /**
   * Connects to the MCPVerse server using SSE with the provided access token.
   * Disconnects any existing connection before establishing a new one.
   * @param accessToken The access token for authentication.
   * @throws {MCPVerseAuthenticationError} If no access token is provided.
   * @throws {Error} If the connection attempt fails.
   */
  async connect(accessToken: string): Promise<void> {
    this.log.info(`${LOG_PREFIX} Attempting to establish connection...`);
    if (!accessToken) {
      this.log.error(`${LOG_PREFIX} Cannot connect without access token.`);
      throw new MCPVerseAuthenticationError(
        "SSE connection: Cannot connect without access token.",
      );
    }

    await this.disconnect();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    this.transport = new StreamableHTTPClientTransport(
      new URL(this.serverUrl + "/mcp"),
      {
        sessionId: this.sessionId,
        requestInit: {
          headers: headers,
        },
        reconnectionOptions: {
          initialReconnectionDelay: 1000,
          maxReconnectionDelay: 30000,
          reconnectionDelayGrowFactor: 1.5,
          maxRetries: 10,
        },
      },
    );

    try {
      await this.client.connect(this.transport, {});
      this.log.info(`${LOG_PREFIX} Connection established.`);
    } catch (error) {
      this.log.error(`${LOG_PREFIX} Failed to connect transport:`, error);
      this.transport = undefined;
      throw error;
    }
  }

  /**
   * Disconnects the current SSE transport if it exists.
   * Logs a warning if an error occurs during the transport closing process.
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      this.log.info(`${LOG_PREFIX} Disconnecting transport...`);
      try {
        // The transport.close() method may trigger async operations that throw
        // We need to give it time to complete and catch any rejections
        const closePromise = Promise.resolve().then(() => {
          this.transport!.close();
        });
        
        await closePromise.catch((error) => {
          // Catch and log any errors from the close operation
          this.log.debug(`${LOG_PREFIX} Expected error during transport close:`, error);
        });
        
      } catch (closeError) {
        this.log.warn(`${LOG_PREFIX} Error closing transport:`, closeError);
      }
      this.transport = undefined;
    }
  }

  /**
   * Checks if the SSE client is currently connected.
   * @returns True if connected, false otherwise.
   */
  get isConnected(): boolean {
    return !!this.transport;
  }

  /**
   * Calls a tool on the server via the SSE connection.
   * @param params The parameters for the tool call.
   * @returns A promise that resolves to the result of the tool call.
   * @throws {MCPVerseUnknownError} If the client is not connected when the call is attempted.
   */
  async callTool(params: CallToolRequest["params"]): Promise<CallToolResult> {
    const timeStart = performance.now();

    if (!this.isConnected) {
      this.log.error(`${LOG_PREFIX} callTool attempted while not connected.`);
      throw new MCPVerseUnknownError(
        "SSE callTool attempted while not connected.",
      );
    }

    this.log.debug(`${LOG_PREFIX} Calling tool: ${params.name}`);

    try {
      // TODO: Resolve this @ts-ignore.
      // There appears to be a type mismatch between the return type of the SDK's `client.callTool`
      // and the expected `CallToolResult` type, even though `CallToolResult` is imported from the SDK.
      // This might indicate a need to update type definitions, adapt the result, or a subtle version incompatibility.
      // @ts-ignore - Reinstating ts-ignore due to complex type mismatch from SDK return vs CallToolResult
      const result: CallToolResult = await this.client.callTool(
        params,
        undefined,
        { timeout: 10_000 },
      );
      if (result.isError) {
        this.log.warn(
          `${LOG_PREFIX} Tool call '${params.name}' returned error:`,
          result.error,
        );
      }
      const timeEnd = performance.now();
      this.log.debug(
        `${LOG_PREFIX} Tool call '${params.name}' took ${timeEnd - timeStart} ms`,
      );
      return result;
    } catch (error) {
      this.log.error(
        `${LOG_PREFIX} Tool call '${params.name}' took ${performance.now() - timeStart} ms and failed with error:`,
        error,
      );
      return toolErrorHandler(error, this.log, params);
    }
  }

  /**
   * Gets the underlying raw MCP SDK Client instance.
   * Useful for accessing lower-level client functionalities if needed.
   * @returns The raw Client instance.
   */
  get rawClient(): Client {
    return this.client;
  }

  /**
   * Sets a handler for incoming notifications from the server.
   * The provided callback will be invoked with the notification type and its parsed data.
   * @param cb A callback function of the shape `(type: string, data: T) => void`.
   *           `type` is the specific notification type string (e.g., 'room/created').
   *           `data` is the parsed data payload for the notification, with type `T`.
   *           Note: `T` should ideally be a union of all possible notification data types defined in `notificationSchema`.
   */
  setNotificationHandler<T>(cb: (type: string, notification: T) => void) {
    this.client.setNotificationHandler(notificationSchema, (notification) => {
      this.log.debug(`${LOG_PREFIX} Received notification:`, notification);
      // The `notification` object here is parsed and validated by Zod via `notificationSchema`.
      // `notification.params` will be a discriminated union of the schemas provided in `notificationSchema.params`.
      // Each of those schemas has a `type` and a `data` field.
      cb(
        notification.params.type as string, // `type` is a string literal or a string matching a regex.
        notification.params.data as T, // `data` is the specific data object for that notification type.
      );
    });
  }

  /**
   * Removes the notification handler for 'notifications/message' method types.
   */
  removeNotificationHandler() {
    this.client.removeNotificationHandler("notifications/message");
  }
}
