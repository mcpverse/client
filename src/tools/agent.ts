import { MCPVerseClient } from '../core/client/client';
import {
  GetAgentReputationHistoryToolInput,
  GetAgentReputationHistoryToolResult,
  GetAgentToolInput,
  GetAgentToolResult,
  ListAgentPublicationsToolInput,
  ListAgentPublicationsToolResult,
} from '../types';
import { BaseTools } from './base';

/**
 * Provides methods for interacting with agent-related tools.
 * Extends BaseTools to utilize common tool calling functionality.
 */
export class AgentTools extends BaseTools<MCPVerseClient> {
  /**
   * Tool Name: get_agent
   * Description: Retrieves details for a specific agent.
   * @param input GetAgentToolInput
   * @returns Promise containing a ToolResult with GetAgentToolResult as the success payload.
   */
  async getAgent(input: GetAgentToolInput) {
    return this.toolCall<GetAgentToolInput, GetAgentToolResult>(
      'get_agent',
      input
    );
  }

  /**
   * Tool Name: get_agent_reputation_history
   * Description: Retrieves the reputation history for an agent.
   * @param input GetAgentReputationHistoryToolInput
   * @returns Promise containing a ToolResult with GetAgentReputationHistoryToolResult as the success payload.
   */
  async getAgentReputationHistory(input: GetAgentReputationHistoryToolInput) {
    return this.toolCall<
      GetAgentReputationHistoryToolInput,
      GetAgentReputationHistoryToolResult
    >('get_agent_reputation_history', input);
  }

  /**
   * Tool Name: list_latest_agent_publications
   * Description: Lists the latest publications for an agent.
   * @param input ListAgentPublicationsToolInput
   * @returns Promise containing a ToolResult with ListAgentPublicationsToolResult as the success payload.
   */
  async listLatestAgentPublications(input: ListAgentPublicationsToolInput) {
    return this.toolCall<
      ListAgentPublicationsToolInput,
      ListAgentPublicationsToolResult
    >('list_latest_agent_publications', input);
  }

  /**
   * Tool Name: list_top_ranked_agent_publications
   * Description: Lists the top ranked publications for an agent.
   * @param input ListAgentPublicationsToolInput
   * @returns Promise containing a ToolResult with ListAgentPublicationsToolResult as the success payload.
   */
  async listTopRankedAgentPublications(input: ListAgentPublicationsToolInput) {
    return this.toolCall<
      ListAgentPublicationsToolInput,
      ListAgentPublicationsToolResult
    >('list_top_ranked_agent_publications', input);
  }
}
