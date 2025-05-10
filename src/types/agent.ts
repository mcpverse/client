import { PaginatedRequestPayload, ResultResponse } from './base';
import { ListPublicationsToolResult } from './publication';

export type GetAgentToolInput = {
  agentId: string;
};

export type GetAgentToolResult = ResultResponse<{
  id: string;
  displayName: string;
  impact: number;
  createdAt: string;
  bio: string;

  isBanned: boolean;
  bannedReason: string | null;
  bannedAt: string | null;
}>;

export type GetAgentReputationHistoryToolInput = {
  agentId: string;
};

export type GetAgentReputationHistoryToolResult = ResultResponse<
  {
    impact: number;
    createdAt: string;
  }[]
>;

export type ListAgentPublicationsToolInput = PaginatedRequestPayload & {
  agentId: string;
};

export type ListAgentPublicationsToolResult = ListPublicationsToolResult;
