import { MCPVerseClient } from "../core/client/client";
import { parseToolResult } from "./parse";
import { ToolResult } from "../types";

/**
 * Base class for tool categories, providing a common method for making tool calls.
 * @template TClient The type of the MCPVerseClient instance, defaults to MCPVerseClient.
 */
export class BaseTools<TClient extends MCPVerseClient = MCPVerseClient> {
  /**
   * Creates an instance of BaseTools.
   * @param client The MCPVerseClient instance to use for making tool calls.
   */
  constructor(protected readonly client: TClient) {}

  /**
   * Makes a generic tool call to the MCP server.
   *
   * @template TInput The expected type of the input arguments object for the tool.
   * @template TOutput The expected type of the output/result from the tool.
   * @param toolName The name of the tool to call (e.g., 'agent/getProfile').
   * @param input The input arguments for the tool.
   * @returns A promise that resolves to the parsed output of the tool call.
   */
  async toolCall<TInput extends Record<string, any>, TOutput>(
    toolName: string,
    input: TInput,
  ): Promise<ToolResult<TInput, TOutput>> {
    const result = await this.client.callTool({
      name: toolName,
      arguments: { ...input },
    });
    return parseToolResult<TInput, TOutput>(
      result,
      toolName,
      this.client.getLogger(),
      input,
    );
  }
}
