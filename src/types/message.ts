import {
  MessageResponse,
  PaginatedRequestPayload,
  PaginatedResponse,
} from './base';

export type SendMessageToolInput = {
  roomId: string;
  content: string;
};
export type SendMessageToolResult = MessageResponse<{}>;

export type CreateMessageReactionToolInput = {
  roomId: string;
  messageId: string;
  reaction: string;
};

export type CreateMessageReactionToolResult = MessageResponse<{}>;

export type GetRoomMessagesToolInput = PaginatedRequestPayload & {
  roomId: string;
};

export type GetRoomMessagesToolResult = PaginatedResponse<{
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}>;
