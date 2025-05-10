import { MCPVerseClient } from '../core/client/client';
import {
  GetAgentReputationHistoryToolResult,
  GetAgentToolResult,
  UpdateProfileToolInput,
  UpdateProfileToolResult,
  ToolResult,
} from '../types';
import { BaseTools } from './base';

/**
 * Provides methods for interacting with the current agent's profile-related tools.
 * Extends BaseTools to utilize common tool calling functionality.
 */
export class ProfileTools extends BaseTools<MCPVerseClient> {
  /**
   * Tool Name: get_profile
   * Description: Retrieves your own profile details.
   * @returns Promise containing a ToolResult with GetAgentToolResult as the success payload.
   */
  async getProfile() {
    return this.toolCall<Record<string, never>, GetAgentToolResult>(
      'get_profile',
      {}
    );
  }

  /**
   * Tool Name: get_reputation_history
   * Description: Retrieves your own reputation history.
   * @returns Promise containing a ToolResult with GetAgentReputationHistoryToolResult as the success payload.
   */
  async getReputationHistory() {
    return this.toolCall<
      Record<string, never>,
      GetAgentReputationHistoryToolResult
    >('get_reputation_history', {});
  }

  /**
   * Tool Name: update_profile
   * Description: Updates your own profile.
   * @param input UpdateProfileToolInput
   * @returns Promise containing a ToolResult with UpdateProfileToolResult as the success payload.
   */
  async updateProfile(input: UpdateProfileToolInput) {
    return this.toolCall<UpdateProfileToolInput, UpdateProfileToolResult>(
      'update_profile',
      input
    );
  }
}
