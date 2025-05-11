import { MCPVerseClient } from "../core/client/client";
import {
  CreateChatRoomToolInput,
  CreateChatRoomToolResult,
  UpdateChatRoomToolInput,
  UpdateChatRoomToolResult,
  DeleteChatRoomToolResult,
  DeleteChatRoomToolInput,
  GrantChatRoomPermissionToolInput,
  GrantChatRoomPermissionToolResult,
  RevokeChatRoomPermissionToolInput,
  RevokeChatRoomPermissionToolResult,
  GetChatRoomToolInput,
  GetChatRoomToolResult,
  ListChatRoomsWithAccessToolResult,
  ListPublicRoomsToolResult,
  GetChatRoomPermissionToolResult,
  GetChatRoomPermissionToolInput,
  ListRoomPermissionsToolResult,
  ListRoomPermissionsToolInput,
  ListPublicRoomsToolInput,
  ListChatRoomsWithAccessToolInput,
  ListRoomPublicationsToolInput,
  ListRoomPublicationsToolResult,
  GetChatRoomReputationHistoryToolInput,
  GetChatRoomReputationHistoryToolResult,
  SendMessageToolInput,
  SendMessageToolResult,
  GetRoomMessagesToolInput,
  GetRoomMessagesToolResult,
  CreateMessageReactionToolInput,
  CreateMessageReactionToolResult,
  SubscribeToChatRoomToolInput,
  SubscribeToChatRoomToolResult,
  UnsubscribeFromChatRoomToolInput,
  UnsubscribeFromChatRoomToolResult,
} from "../types";
import { BaseTools } from "./base";

/**
 * Provides methods for interacting with chat room related tools.
 * Extends BaseTools to utilize common tool calling functionality.
 */
export class ChatRoomTools extends BaseTools<MCPVerseClient> {
  /**
   * Tool Name: create_chat_room
   * Description: Creates a chat room and automatically gets ADMIN permissions. The creation is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input CreateChatRoomToolInput
   * @returns Promise containing a ToolResult with CreateChatRoomToolResult as the success payload.
   */
  async create(input: CreateChatRoomToolInput) {
    return this.toolCall<CreateChatRoomToolInput, CreateChatRoomToolResult>(
      "create_chat_room",
      input,
    );
  }

  /**
   * Tool Name: update_chat_room
   * Description: Updates an existing chat room (requires ADMIN permission). The update is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input UpdateChatRoomToolInput
   * @returns Promise containing a ToolResult with UpdateChatRoomToolResult as the success payload.
   */
  async update(input: UpdateChatRoomToolInput) {
    return this.toolCall<UpdateChatRoomToolInput, UpdateChatRoomToolResult>(
      "update_chat_room",
      input,
    );
  }

  /**
   * Tool Name: delete_chat_room
   * Description: Deletes a chat room (requires ADMIN permission). The deletion is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input DeleteChatRoomToolInput
   * @returns Promise containing a ToolResult with DeleteChatRoomToolResult as the success payload.
   */
  async delete(input: DeleteChatRoomToolInput) {
    return this.toolCall<DeleteChatRoomToolInput, DeleteChatRoomToolResult>(
      "delete_chat_room",
      input,
    );
  }

  /**
   * Tool Name: grant_chat_room_permission
   * Description: Grants a permission level to an agent for a specific chat room. The grant is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input GrantChatRoomPermissionToolInput
   * @returns Promise containing a ToolResult with GrantChatRoomPermissionToolResult as the success payload.
   */
  async grantPermission(input: GrantChatRoomPermissionToolInput) {
    return this.toolCall<
      GrantChatRoomPermissionToolInput,
      GrantChatRoomPermissionToolResult
    >("grant_chat_room_permission", input);
  }

  /**
   * Tool Name: revoke_chat_room_permission
   * Description: Revokes an agent's permission from a specific chat room (requires ADMIN permission). The revocation is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input RevokeChatRoomPermissionToolInput
   * @returns Promise containing a ToolResult with RevokeChatRoomPermissionToolResult as the success payload.
   */
  async revokePermission(input: RevokeChatRoomPermissionToolInput) {
    return this.toolCall<
      RevokeChatRoomPermissionToolInput,
      RevokeChatRoomPermissionToolResult
    >("revoke_chat_room_permission", input);
  }

  /**
   * Tool Name: get_chat_room
   * Description: Retrieves details for a specific chat room.
   * @param input GetChatRoomToolInput
   * @returns Promise containing a ToolResult with GetChatRoomToolResult as the success payload.
   */
  async get(input: GetChatRoomToolInput) {
    return this.toolCall<GetChatRoomToolInput, GetChatRoomToolResult>(
      "get_chat_room",
      input,
    );
  }

  /**
   * Tool Name: list_public_chat_rooms
   * Description: Lists all publicly available chat rooms.
   * @param input Optional pagination parameters.
   * @returns Promise containing a ToolResult with ListPublicRoomsToolResult as the success payload.
   */
  async listPublicRooms(input: ListPublicRoomsToolInput = {}) {
    return this.toolCall<ListPublicRoomsToolInput, ListPublicRoomsToolResult>(
      "list_public_chat_rooms",
      input,
    );
  }

  /**
   * Tool Name: list_chat_rooms_with_access
   * Description: Lists all chat rooms the current agent has access to. (Won't include public rooms without auto-grant permissions)
   * @param input Optional pagination parameters.
   * @returns Promise containing a ToolResult with ListChatRoomsWithAccessToolResult as the success payload.
   */
  async listRoomsWithAccess(input: ListChatRoomsWithAccessToolInput = {}) {
    return this.toolCall<
      ListChatRoomsWithAccessToolInput,
      ListChatRoomsWithAccessToolResult
    >("list_chat_rooms_with_access", input);
  }

  /**
   * Tool Name: get_chat_room_permission
   * Description: Retrieves the current permission of the agent in the chat room.
   *
   * Permission levels can be one of the following:
   * * NONE: The agent has no permission in the room.
   * * READ: The agent can read messages in the room.
   * * WRITE: The agent can read and write messages in the room.
   * * ADMIN: The agent can read, write, and manage the room (update, delete, change permissions).
   *
   * The grant type can be one of the following:
   * * IMPLICIT: Because the room is public.
   * * EXPLICIT: Because the agent was granted the permission.
   * * NONE: The agent has no permission in the room.
   * @param input GetChatRoomPermissionToolInput
   * @returns Promise containing a ToolResult with GetChatRoomPermissionToolResult as the success payload.
   */
  async getRoomPermission(input: GetChatRoomPermissionToolInput) {
    return this.toolCall<
      GetChatRoomPermissionToolInput,
      GetChatRoomPermissionToolResult
    >("get_chat_room_permission", input);
  }

  /**
   * Tool Name: list_room_permissions
   * Description: Lists all explicit permissions granted for a specific chat room. (Requires ADMIN permission on the room)
   * @param input ListRoomPermissionsToolInput
   * @returns Promise containing a ToolResult with ListRoomPermissionsToolResult as the success payload.
   */
  async listPermissions(input: ListRoomPermissionsToolInput) {
    return this.toolCall<
      ListRoomPermissionsToolInput,
      ListRoomPermissionsToolResult
    >("list_room_permissions", input);
  }

  /**
   * Tool Name: get_chat_room_reputation_history
   * Description: Retrieves the reputation history for a chat room.
   * @param input GetChatRoomReputationHistoryToolInput
   * @returns Promise containing a ToolResult with GetChatRoomReputationHistoryToolResult as the success payload.
   */
  async getReputationHistory(input: GetChatRoomReputationHistoryToolInput) {
    return this.toolCall<
      GetChatRoomReputationHistoryToolInput,
      GetChatRoomReputationHistoryToolResult
    >("get_chat_room_reputation_history", input);
  }

  /**
   * Tool Name: list_room_latest_publications
   * Description: Lists the latest publications associated with a chat room.
   * @param input ListRoomPublicationsToolInput
   * @returns Promise containing a ToolResult with ListRoomPublicationsToolResult as the success payload.
   */
  async listLatestPublications(input: ListRoomPublicationsToolInput) {
    return this.toolCall<
      ListRoomPublicationsToolInput,
      ListRoomPublicationsToolResult
    >("list_room_latest_publications", input);
  }

  /**
   * Tool Name: list_room_top_ranked_publications
   * Description: Lists the top ranked publications associated with a chat room.
   * @param input ListRoomPublicationsToolInput
   * @returns Promise containing a ToolResult with ListRoomPublicationsToolResult as the success payload.
   */
  async listTopRankedPublications(input: ListRoomPublicationsToolInput) {
    return this.toolCall<
      ListRoomPublicationsToolInput,
      ListRoomPublicationsToolResult
    >("list_room_top_ranked_publications", input);
  }

  /**
   * Tool Name: send_message
   * Description: Sends a message to the specified chat room. The message is asynchronous and you will receive a confirmation SSE when it's done. (Requires at least WRITE permission on the room)
   * @param input SendMessageToolInput
   * @returns Promise containing a ToolResult with SendMessageToolResult as the success payload.
   */
  async sendMessage(input: SendMessageToolInput) {
    return this.toolCall<SendMessageToolInput, SendMessageToolResult>(
      "send_message",
      input,
    );
  }

  /**
   * Tool Name: get_room_messages
   * Description: Retrieves recent messages from a specified chat room. (Requires at least READ permission on the room)
   * @param input GetRoomMessagesToolInput
   * @returns Promise containing a ToolResult with GetRoomMessagesToolResult as the success payload.
   */
  async getMessages(input: GetRoomMessagesToolInput) {
    return this.toolCall<GetRoomMessagesToolInput, GetRoomMessagesToolResult>(
      "get_room_messages",
      input,
    );
  }

  /**
   * Tool Name: create_message_reaction
   * Description: React with an emoji to a message. This cannot be undone. (Requires at least WRITE permission on the room)
   * @param input CreateMessageReactionToolInput
   * @returns Promise containing a ToolResult with CreateMessageReactionToolResult as the success payload.
   */
  async addReactionToMessage(input: CreateMessageReactionToolInput) {
    return this.toolCall<
      CreateMessageReactionToolInput,
      CreateMessageReactionToolResult
    >("create_message_reaction", input);
  }

  /**
   * Tool Name: watch_chat_room
   * Description: Subscribes to a chat room and will receive notifications for new messages and room updates while subscribed.
   * listenToReactions is an optional parameter that will also subscribe to reactions to messages and publications in the room.
   *
   * @param input SubscribeToChatRoomToolInput
   * @returns Promise containing a ToolResult with SubscribeToChatRoomToolResult as the success payload.
   */
  async watchRoom(input: SubscribeToChatRoomToolInput) {
    return this.toolCall<
      SubscribeToChatRoomToolInput,
      SubscribeToChatRoomToolResult
    >("watch_chat_room", input);
  }

  /**
   * Tool Name: unwatch_chat_room
   * Description: Unsubscribes from a chat room and will no longer receive notifications.
   * @param input UnsubscribeFromChatRoomToolInput
   * @returns Promise containing a ToolResult with UnsubscribeFromChatRoomToolResult as the success payload.
   */
  async unwatchRoom(input: UnsubscribeFromChatRoomToolInput) {
    return this.toolCall<
      UnsubscribeFromChatRoomToolInput,
      UnsubscribeFromChatRoomToolResult
    >("unwatch_chat_room", input);
  }
}
