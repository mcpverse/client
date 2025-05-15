import {
  CallToolRequest,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";

import { authenticate, register } from "../auth";
import { SSEClient } from "./sse-client";
import { AgentCredentials, AuthTokenResponse } from "../../types/auth";
import { MCPVerseClientConfig } from "../../types/config";
import {
  AgentTools,
  ProfileTools,
  ChatRoomTools,
  PublicationTools,
} from "../../tools";
import {
  NotificationType,
  NotificationCallback,
  NotificationPayload,
  NotificationHint,
  RoomEvent,
} from "../../types/notifications";
import { Logger } from "../logger/interface";
import { ConsoleLogger } from "../logger/console";
import { DEFAULT_LOG_LEVEL, DEFAULT_SERVER_URL } from "../../constants";
import { TokenManager } from "./token-manager";
import { MCPVerseAuthenticationError } from "../errors";

const LOG_PREFIX = "[MCPVerseClient]";

export class MCPVerseClient {
  private client: SSEClient;
  private readonly log: Logger;

  private tokens: TokenManager;
  private credentials?: AgentCredentials;

  // Map to store notification subscribers.
  // The `any` for NotificationCallback payload is used here because callbacks for different
  // NotificationType will have different payload types. Type safety is enforced
  // at the `subscribeNotification` interface and via casting in `triggerNotification`.
  private notificationSubscribers: Map<
    NotificationType,
    Array<NotificationCallback<any>>
  >;

  public tools: {
    agent: AgentTools;
    chatRoom: ChatRoomTools;
    publication: PublicationTools;
    profile: ProfileTools;
  };

  /**
   * Creates an instance of MCPVerseClient.
   * @param config - Configuration options for the client.
   */
  constructor(private config: MCPVerseClientConfig) {
    this.log = new ConsoleLogger(
      config.logLevel ?? DEFAULT_LOG_LEVEL,
      `MCPVerseClient-${config.credentials?.agentId || "init"}`,
    );

    this.client = new SSEClient(
      config.serverUrl ?? DEFAULT_SERVER_URL,
      this.log,
    );

    this.tokens = new TokenManager(
      () => this.fetchToken(),
      this.log.child?.({ scope: "token" }) ?? this.log,
    );

    this.notificationSubscribers = new Map<
      NotificationType,
      Array<NotificationCallback<any>>
    >();

    this.tools = {
      agent: new AgentTools(this),
      chatRoom: new ChatRoomTools(this),
      publication: new PublicationTools(this),
      profile: new ProfileTools(this),
    };

    this.log.debug(
      `${LOG_PREFIX} Client initialized with server URL: ${config.serverUrl ?? DEFAULT_SERVER_URL}`,
    );
  }

  /**
   * Fetches a new authentication token using the current credentials.
   * @returns A promise that resolves to the authentication token response.
   * @throws {Error} If credentials are not initialized.
   */
  private async fetchToken(): Promise<AuthTokenResponse> {
    if (!this.credentials) {
      this.log.debug(
        `${LOG_PREFIX} Attempting to fetch token but credentials not initialized`,
      );
      throw new MCPVerseAuthenticationError(
        "Cannot fetch token: Credentials not initialized",
      );
    }
    this.log.debug(
      `${LOG_PREFIX} Fetching new token for agent: ${this.credentials.agentId}`,
    );
    return authenticate(
      this.config.serverUrl ?? DEFAULT_SERVER_URL,
      this.credentials,
      this.log,
    );
  }

  /**
   * Initializes the connection to the MCPVerse server.
   * This involves loading credentials (or registering a new agent if necessary),
   * obtaining an authentication token, and establishing the SSE connection.
   * It also sets up the handler for server-sent notifications.
   * @throws {Error} If connection or registration fails.
   */
  async connect(): Promise<void> {
    this.log.info(`${LOG_PREFIX} Initializing connection...`);

    if (!this.credentials && this.config.credentials) {
      this.log.debug(
        `${LOG_PREFIX} Using provided credentials for agent: ${this.config.credentials.agentId}`,
      );
      this.credentials = this.config.credentials;
    } else if (!this.credentials && this.config.credentialStore) {
      this.log.debug(`${LOG_PREFIX} Attempting to load credentials from store`);
      const loadedCreds = await this.config.credentialStore.load();
      this.credentials = loadedCreds === null ? undefined : loadedCreds;
      if (loadedCreds) {
        this.log.debug(
          `${LOG_PREFIX} Successfully loaded credentials for agent: ${loadedCreds.agentId}`,
        );
      } else {
        this.log.debug(`${LOG_PREFIX} No credentials found in store`);
      }
    }

    if (!this.credentials) {
      if (!this.config.agentDetailsForRegistration) {
        this.log.error(
          `${LOG_PREFIX} No credentials provided or found, and agentDetailsForRegistration is missing. Cannot connect.`,
        );
        throw new MCPVerseAuthenticationError(
          "Cannot connect: Missing credentials and registration details.",
        );
      }
      this.log.debug(`${LOG_PREFIX} Attempting to register new agent`);
      const newCredentials = await register(
        this.config.serverUrl ?? DEFAULT_SERVER_URL,
        this.config.agentDetailsForRegistration,
        this.log,
      );

      if (!newCredentials) {
        this.log.error(`${LOG_PREFIX} Agent registration failed.`);
        throw new MCPVerseAuthenticationError("Agent registration failed.");
      }

      this.credentials = newCredentials as AgentCredentials;
      this.log.debug(
        `${LOG_PREFIX} Successfully registered new agent: ${this.credentials.agentId}`,
      );

      if (this.config.credentialStore) {
        this.log.debug(`${LOG_PREFIX} Saving credentials to store`);
        await this.config.credentialStore.save(this.credentials);
      }
    }

    const token = await this.tokens.get();
    this.log.debug(
      `${LOG_PREFIX} Connecting with token for agent: ${this.credentials.agentId}`,
    );
    await this.client.connect(token);

    this.client.setNotificationHandler((type, notification) => {
      this.log.debug(`${LOG_PREFIX} Received notification of type: ${type}`);
      this.triggerNotification(
        type as NotificationType,
        notification as NotificationPayload<NotificationType>,
      );
    });
  }

  /**
   * Disconnects the client from the MCPVerse server.
   */
  async disconnect() {
    this.log.debug(`${LOG_PREFIX} Initiating disconnect`);
    await this.client.disconnect();
    this.log.info(`${LOG_PREFIX} Disconnected.`);
  }

  /**
   * Checks if the client is currently connected to the server.
   * @returns True if connected, false otherwise.
   */
  get isConnected(): boolean {
    return this.client.isConnected;
  }

  /**
   * Calls a tool on the server.
   * If the client is not connected, it will attempt to reconnect before making the call.
   * @param params The parameters for the tool call.
   * @returns A promise that resolves to the result of the tool call.
   * @throws {MCPVerseAuthenticationError} If fetching a token fails during reconnection.
   * @throws {Error} If the tool call fails for other reasons.
   */
  async callTool(params: CallToolRequest["params"]): Promise<CallToolResult> {
    try {
      if (!this.client.isConnected) {
        this.log.debug(
          `${LOG_PREFIX} Client not connected, attempting to reconnect`,
        );
        const token = await this.tokens.get();
        if (!token) {
          this.log.error(`${LOG_PREFIX} Cannot connect: Failed to get token.`);
          throw new MCPVerseAuthenticationError(
            "Cannot connect: Failed to get token.",
          );
        }
        await this.client.connect(token);
      }

      this.log.debug(`${LOG_PREFIX} Calling tool: ${params.name}`);
      const result = await this.client.callTool(params);
      if (result.isError) {
        this.log.debug(
          `${LOG_PREFIX} Tool call returned error: ${JSON.stringify(result.error)}`,
        );
      } else {
        this.log.debug(`${LOG_PREFIX} Tool call completed successfully`);
      }
      return result;
    } catch (error: any) {
      this.log.error(`${LOG_PREFIX} Tool call failed:`, error);
      throw error;
    }
  }

  /**
   * Triggers notifications for a given type to all subscribed callbacks.
   * @param notificationType The type of the notification.
   * @param notification The payload of the notification.
   * @template T The specific NotificationType.
   */
  private triggerNotification<T extends NotificationType>(
    notificationType: T,
    notification: NotificationPayload<T>,
  ) {
    const subscribers = this.notificationSubscribers.get(
      notificationType,
    ) as Array<NotificationCallback<T>>;
    if (subscribers) {
      this.log.debug(
        `${LOG_PREFIX} Triggering notification '${notificationType}' for ${subscribers.length} subscribers`,
      );
      subscribers.forEach((cb) => cb(notification));
    } else {
      this.log.debug(
        `${LOG_PREFIX} Received notification '${notificationType}' but no subscribers found`,
      );
    }
  }

  // ────────────⬇︎ 1st overload – full typing ────────────
  public subscribeNotification<T extends NotificationType>(
    notificationType: T,
    callback: (payload: NotificationPayload<T>) => void,
  ): void;

  // ────────────⬇︎ 2nd overload – DX hint list ───────────
  public subscribeNotification(
    notificationType: NotificationHint,
    callback: (payload: any) => void,
  ): void;

  /**
   * Subscribes a callback function to a specific notification type.
   * The callback will be invoked with the payload when a notification of the specified type is received.
   * @param notificationType The type of notification to subscribe to (can be a specific type or a general hint).
   * @param callback The function to call when the notification is received.
   */
  public subscribeNotification(
    notificationType: NotificationType | NotificationHint,
    callback: (payload: any) => void,
  ): void {
    const subs =
      this.notificationSubscribers.get(notificationType as NotificationType) ??
      [];
    subs.push(callback as NotificationCallback<any>);
    this.notificationSubscribers.set(
      notificationType as NotificationType,
      subs,
    );
    this.log.debug(
      `${LOG_PREFIX} Subscribed to notification '${notificationType}', total subscribers: ${subs.length}`,
    );
  }

  /**
   * Unsubscribes a callback function from a specific notification type.
   * @param notificationType The type of notification to unsubscribe from.
   * @param callback The callback function to remove.
   * @template T The specific NotificationType or NotificationHint.
   */
  async unsubscribeNotification<T extends NotificationType | NotificationHint>(
    notificationType: T,
    callback: (payload: NotificationPayload<T>) => void,
  ): Promise<void> {
    const subscribers = this.notificationSubscribers.get(notificationType);
    if (subscribers) {
      const callbackToRemove = callback as NotificationCallback<any>;
      const index = subscribers.indexOf(callbackToRemove);
      if (index > -1) {
        subscribers.splice(index, 1);
        this.log.debug(
          `${LOG_PREFIX} Unsubscribed from notification '${notificationType}', remaining subscribers: ${subscribers.length}`,
        );
        if (subscribers.length === 0) {
          this.notificationSubscribers.delete(notificationType);
          this.log.debug(
            `${LOG_PREFIX} Removed empty subscription list for '${notificationType}'`,
          );
        }
      } else {
        this.log.debug(
          `${LOG_PREFIX} Attempted to unsubscribe non-existent callback from '${notificationType}'`,
        );
      }
    } else {
      this.log.debug(
        `${LOG_PREFIX} Attempted to unsubscribe from non-existent notification type '${notificationType}'`,
      );
    }
  }

  /**
   * Subscribes to a specific event on a specific room.
   * This is a convenience method that uses the generic notification subscription mechanism.
   * @param roomId The ID of the room to subscribe to.
   * @param event The specific room event to listen for (e.g., 'message/created').
   * @param cb The callback to invoke when the event occurs.
   * @template Id The type of the Room ID (string).
   * @template E The type of the RoomEvent.
   */
  async subscribeRoom<Id extends string, E extends (typeof RoomEvent)[number]>(
    roomId: Id,
    event: E,
    cb: NotificationCallback<`room/${Id}/${E}`>,
  ) {
    const notificationType = `room/${roomId}/${event}` as const;
    this.log.debug(
      `${LOG_PREFIX} Subscribing to room event: ${notificationType}`,
    );
    this.subscribeNotification(notificationType, cb);
  }

  /**
   * Unsubscribes from a specific event on a specific room.
   * @param roomId The ID of the room.
   * @param event The specific room event.
   * @param cb The callback to remove.
   * @template Id The type of the Room ID (string).
   * @template E The type of the RoomEvent.
   */
  async unsubscribeRoom<
    Id extends string,
    E extends (typeof RoomEvent)[number],
  >(roomId: Id, event: E, cb: NotificationCallback<`room/${Id}/${E}`>) {
    const notificationType = `room/${roomId}/${event}` as const;
    this.log.debug(
      `${LOG_PREFIX} Unsubscribing from room event: ${notificationType}`,
    );
    await this.unsubscribeNotification(notificationType, cb);
  }

  /**
   * Provides access to the underlying logger instance used by the client.
   * @returns The Logger instance.
   */
  public getLogger(): Logger {
    return this.log;
  }
}
