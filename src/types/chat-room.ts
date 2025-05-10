import {
  PaginatedResponse,
  PaginatedRequestPayload,
  ResultResponse,
  MessageResponse,
} from './base';

export type CreateChatRoomToolInput = {
  displayName?: string;
  description?: string;
  isPublic?: boolean;
  isReadOnly?: boolean;
  messageTtlSeconds?: number;
  autoGrantPermissions?: boolean;
};

export type CreateChatRoomToolResult = MessageResponse<{
  roomId: string;
}>;

export type UpdateChatRoomToolInput = {
  roomId: string;
  displayName?: string;
  description?: string;
  isPublic?: boolean;
  isReadOnly?: boolean;
  messageTtlSeconds?: number;
  autoGrantPermissions?: boolean;
};

export type UpdateChatRoomToolResult = MessageResponse<{
  roomId: string;
}>;

export type DeleteChatRoomToolInput = {
  roomId: string;
};

export type DeleteChatRoomToolResult = MessageResponse<{
  roomId: string;
}>;

export type SubscribeToChatRoomToolInput = {
  roomId: string;
};

export type SubscribeToChatRoomToolResult = MessageResponse<{
  roomId: string;
}>;

export type UnsubscribeFromChatRoomToolInput = {
  roomId: string;
};

export type UnsubscribeFromChatRoomToolResult = MessageResponse<{
  roomId: string;
}>;

export type GrantChatRoomPermissionToolInput = {
  roomId: string;
  agentId: string;
  permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
};

export type GrantChatRoomPermissionToolResult = MessageResponse<{
  roomId: string;
}>;

export type RevokeChatRoomPermissionToolInput = {
  roomId: string;
  agentId: string;
};

export type RevokeChatRoomPermissionToolResult = MessageResponse<{
  roomId: string;
}>;

export type GetChatRoomToolInput = {
  roomId: string;
};

export type GetChatRoomToolResult = ResultResponse<{
  id: string;
  displayName: string | null;
  description: string | null;
  isPublic: boolean;
  isReadOnly: boolean;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  messageTtlSeconds: number;
  impact: number;
  autoGrantPermissions: boolean;

  isBanned: boolean;
  bannedReason?: string | null;
  bannedAt?: string | null;

  isDeleted: boolean;
  deletedAt?: string | null;
}>;

export type ListPublicRoomsToolInput = PaginatedRequestPayload;

export type ListPublicRoomsToolResult = PaginatedResponse<{
  id: string;
  displayName?: string | null;
  createdAt: string;
  impact: number;

  isBanned?: boolean;
  isDeleted?: boolean;
}>;

export type ListChatRoomsWithAccessToolInput = PaginatedRequestPayload;

export type ListChatRoomsWithAccessToolResult = PaginatedResponse<{
  id: string;
  displayName?: string | null;
  createdAt: string;
  impact: number;

  isBanned?: boolean;
  isDeleted?: boolean;
}>;

export type GetChatRoomPermissionToolInput = {
  roomId: string;
};

export type GetChatRoomPermissionToolResult = ResultResponse<{
  permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
  grantType: 'NONE' | 'IMPLICIT' | 'EXPLICIT';
}>;

export type ListRoomPermissionsToolInput = PaginatedRequestPayload & {
  roomId: string;
};

export type ListRoomPermissionsToolResult = PaginatedResponse<{
  id: string;
  agentId: string;
  permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
}>;

export type GetChatRoomReputationHistoryToolInput = {
  roomId: string;
};

export type GetChatRoomReputationHistoryToolResult = ResultResponse<
  {
    impact: number;
    createdAt: string;
  }[]
>;

export type ListRoomPublicationsToolInput = PaginatedRequestPayload & {
  roomId: string;
};

export type ListRoomPublicationsToolResult = PaginatedResponse<{
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  isBanned: boolean;
  bannedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
}>;
