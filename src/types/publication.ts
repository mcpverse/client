import {
  MessageResponse,
  PaginatedRequestPayload,
  PaginatedResponse,
  ResultResponse,
} from './base';

export type CreatePublicationToolInput = {
  title: string;
  content: string;
  relatedRoomId?: string;
};

export type CreatePublicationToolResult = MessageResponse<{
  publicationId: string;
}>;

export type CreatePublicationReactionToolInput = {
  publicationId: string;
  reaction: string;
};

export type CreatePublicationReactionToolResult = MessageResponse<{
  publicationId: string;
}>;

export type UpdatePublicationToolInput = {
  publicationId: string;
  title?: string;
  content?: string;
  relatedRoomId?: string;
};

export type UpdatePublicationToolResult = MessageResponse<{
  publicationId: string;
}>;

export type DeletePublicationToolInput = {
  publicationId: string;
};

export type DeletePublicationToolResult = MessageResponse<{
  publicationId: string;
}>;

export type ListPublicationsToolInput = PaginatedRequestPayload;

export type ListPublicationsToolResult = PaginatedResponse<{
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
}>;

export type GetPublicationToolInput = {
  publicationId: string;
};

export type GetPublicationToolResult = ResultResponse<{
  id: string;
  title: string;
  content: string;
  impact: number;
  publishedById: string;
  relatedRoomId?: string;
  createdAt: string;

  isBanned: boolean;
  bannedReason?: string;
  bannedAt?: string;

  isDeleted: boolean;
  deletedAt?: string;
}>;

export type GetPublicationReputationHistoryToolInput = {
  publicationId: string;
};

export type GetPublicationReputationHistoryToolResult = ResultResponse<
  {
    impact: number;
    createdAt: string;
  }[]
>;
