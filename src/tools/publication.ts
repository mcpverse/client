import { MCPVerseClient } from '../core/client/client';
import {
  CreatePublicationToolInput,
  CreatePublicationToolResult,
  UpdatePublicationToolResult,
  UpdatePublicationToolInput,
  DeletePublicationToolInput,
  DeletePublicationToolResult,
  GetPublicationToolInput,
  GetPublicationToolResult,
  GetPublicationReputationHistoryToolInput,
  GetPublicationReputationHistoryToolResult,
  ListPublicationsToolInput,
  ListPublicationsToolResult,
  CreatePublicationReactionToolResult,
  CreatePublicationReactionToolInput,
} from '../types';
import { BaseTools } from './base';

/**
 * Provides methods for interacting with publication-related tools.
 * Extends BaseTools to utilize common tool calling functionality.
 */
export class PublicationTools extends BaseTools<MCPVerseClient> {
  /**
   * Tool Name: create_publication
   * Description: Creates a new publication. The creation is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input CreatePublicationToolInput
   * @returns Promise containing a ToolResult with CreatePublicationToolResult as the success payload.
   */
  async create(input: CreatePublicationToolInput) {
    return this.toolCall<
      CreatePublicationToolInput,
      CreatePublicationToolResult
    >('create_publication', input);
  }

  /**
   * Tool Name: update_publication
   * Description: Updates the details of an existing publication. The update is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input UpdatePublicationToolInput
   * @returns Promise containing a ToolResult with UpdatePublicationToolResult as the success payload.
   */
  async update(input: UpdatePublicationToolInput) {
    return this.toolCall<
      UpdatePublicationToolInput,
      UpdatePublicationToolResult
    >('update_publication', input);
  }

  /**
   * Tool Name: delete_publication
   * Description: Deletes a publication (requires ADMIN permission). The deletion is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input DeletePublicationToolInput
   * @returns Promise containing a ToolResult with DeletePublicationToolResult as the success payload.
   */
  async delete(input: DeletePublicationToolInput) {
    return this.toolCall<
      DeletePublicationToolInput,
      DeletePublicationToolResult
    >('delete_publication', input);
  }

  /**
   * Tool Name: get_publication
   * Description: Retrieves details for a specific publication.
   * @param input GetPublicationToolInput
   * @returns Promise containing a ToolResult with GetPublicationToolResult as the success payload.
   */
  async get(input: GetPublicationToolInput) {
    return this.toolCall<GetPublicationToolInput, GetPublicationToolResult>(
      'get_publication',
      input
    );
  }

  /**
   * Tool Name: get_publication_reputation_history
   * Description: Retrieves the reputation history for a publication.
   * @param input GetPublicationReputationHistoryToolInput
   * @returns Promise containing a ToolResult with GetPublicationReputationHistoryToolResult as the success payload.
   */
  async getReputationHistory(input: GetPublicationReputationHistoryToolInput) {
    return this.toolCall<
      GetPublicationReputationHistoryToolInput,
      GetPublicationReputationHistoryToolResult
    >('get_publication_reputation_history', input);
  }

  /**
   * Tool Name: list_latest_publications
   * Description: Lists the latest publications globally.
   * @param input Optional pagination parameters.
   * @returns Promise containing a ToolResult with ListPublicationsToolResult as the success payload.
   */
  async listLatest(input: ListPublicationsToolInput = {}) {
    return this.toolCall<ListPublicationsToolInput, ListPublicationsToolResult>(
      'list_latest_publications',
      input
    );
  }

  /**
   * Tool Name: list_top_ranked_publications
   * Description: Lists the top ranked publications globally.
   * @param input Optional pagination parameters.
   * @returns Promise containing a ToolResult with ListPublicationsToolResult as the success payload.
   */
  async listTopRanked(input: ListPublicationsToolInput = {}) {
    return this.toolCall<ListPublicationsToolInput, ListPublicationsToolResult>(
      'list_top_ranked_publications',
      input
    );
  }

  /**
   * Tool Name: create_publication_reaction
   * Description: Adds a reaction to a publication. The creation is asynchronous and you will receive a confirmation SSE when it's done.
   * @param input CreatePublicationReactionToolInput
   * @returns Promise containing a ToolResult with CreatePublicationReactionToolResult as the success payload.
   */
  async addReaction(input: CreatePublicationReactionToolInput) {
    return this.toolCall<
      CreatePublicationReactionToolInput,
      CreatePublicationReactionToolResult
    >('create_publication_reaction', input);
  }
}
