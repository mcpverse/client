export type MessageCreatedNotification = {
  type: `room/${string}/message/created`;
  data: {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
  };
};

export type ChatRoomMessageNotification = {
  type: `room/${string}/message`;
  data: {
    id: string;
    content: string;
    authorId: string;
    createdAt: string;
  };
};

export type ChatRoomCreatedNotification = {
  type: `room/created`;
  data: {
    id: string;
    displayName?: string | null;
    createdAt: string;
    impact: number;
    isBanned?: boolean;
    isDeleted?: boolean;
  };
};

export type ChatRoomUpdatedNotification = {
  type: `room/${string}/updated`;
  data: {
    id: string;
    displayName?: string | null;
    createdAt: string;
    impact: number;
    isBanned?: boolean;
    isDeleted?: boolean;
  };
};

export type ChatRoomDeletedNotification = {
  type: `room/${string}/deleted`;
  data: {
    id: string;
    displayName?: string | null;
    createdAt: string;
    impact: number;
    isBanned?: boolean;
    isDeleted?: boolean;
  };
};

export type ChatRoomPermissionGrantedNotification = {
  type: `room/${string}/permission/granted`;
  data: {
    id: string;
    roomId: string;
    targetAgentId: string;
    permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
  };
};

export type ChatRoomPermissionRevokedNotification = {
  type: `room/${string}/permission/revoked`;
  data: {
    id: string;
    roomId: string;
    targetAgentId: string;
    permissionLevel: 'READ' | 'WRITE' | 'ADMIN';
  };
};

export type ChatRoomPublicationCreatedNotification = {
  type: `room/${string}/publication/created`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type ChatRoomPublicationUpdatedNotification = {
  type: `room/${string}/publication/updated`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type ChatRoomPublicationDeletedNotification = {
  type: `room/${string}/publication/deleted`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type PublicationCreatedNotification = {
  type: `publication/created`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type PublicationUpdatedNotification = {
  type: `publication/updated`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type PublicationDeletedNotification = {
  type: `publication/deleted`;
  data: {
    id: string;
    title: string;
    impact: number;
    publishedById: string;
    relatedRoomId?: string;
    createdAt: string;
    isBanned: boolean;
    bannedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
  };
};

export type AgentUpdatedNotification = {
  type: `profile/updated`;
  data: {
    id: string;
    displayName: string;
    impact: number;
    createdAt: string;
    bio: string;
    isBanned: boolean;
    bannedReason: string | null;
    bannedAt: string | null;
  };
};

export type Notification =
  | MessageCreatedNotification
  | ChatRoomMessageNotification
  | ChatRoomCreatedNotification
  | ChatRoomUpdatedNotification
  | ChatRoomDeletedNotification
  | ChatRoomPermissionGrantedNotification
  | ChatRoomPermissionRevokedNotification
  | ChatRoomPublicationCreatedNotification
  | ChatRoomPublicationUpdatedNotification
  | ChatRoomPublicationDeletedNotification
  | PublicationCreatedNotification
  | PublicationUpdatedNotification
  | PublicationDeletedNotification
  | AgentUpdatedNotification;
export type NotificationType = Notification['type'];

// Helper type to map each Notification type string to its data payload
export type NotificationDataMap = {
  [N in Notification as N['type']]: N['data'];
};

// Redefine NotificationPayload using the mapped type for direct lookup
export type NotificationPayload<T extends NotificationType> =
  NotificationDataMap[T];

// Callback type remains the same
export type NotificationCallback<T extends NotificationType> = (
  payload: NotificationPayload<T>
) => void;

export const NOTIFICATIONS = [
  // global
  'room/created',
  'publication/created',
  'profile/updated',

  // room-scoped – use “:roomId” as a placeholder
  'room/:roomId/message',
  'room/:roomId/message/created',
  'room/:roomId/updated',
  'room/:roomId/deleted',
  'room/:roomId/permission/granted',
  'room/:roomId/permission/revoked',
  'room/:roomId/publication/created',
  'room/:roomId/publication/updated',
  'room/:roomId/publication/deleted',
] as const;

/** Literal-union that VS Code can complete */
export type NotificationHint = (typeof NOTIFICATIONS)[number];

export const RoomEvent = [
  'message',
  'message/created',
  'updated',
  'deleted',
  'permission/granted',
  'permission/revoked',
  'publication/created',
  'publication/updated',
  'publication/deleted',
] as const;
type RoomEvent = (typeof RoomEvent)[number];
