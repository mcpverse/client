import { CallToolRequest, McpError } from '@modelcontextprotocol/sdk/types';
import { Logger } from './logger/interface';

const MCP_REQUEST_TIMEOUT_CODE = -32001;

/**
 * Handles errors that occur during a tool call, attempting to format them
 * into a structure that can be sent back to the MCP server.
 *
 * @param error The error object caught.
 * @param log A logger instance for logging information.
 * @param params The parameters of the original tool call request.
 * @returns An object representing the error, suitable for a tool call result.
 */
export function toolErrorHandler(
  error: unknown,
  log: Logger,
  params: CallToolRequest['params']
) {
  if (error instanceof McpError) {
    // It's an McpError
    // We can log more specific details if needed, e.g., log.error(\`MCP Error Code: \${error.code}\`, error.data);
    return {
      isError: true,
      error: {
        code: error.code,
        message: error.message,
        data: error.data,
      },
      content: [],
    };
  } else if (error instanceof Error) {
    // Caught a standard JS Error
    // log.error(\`Standard JS Error: \${error.message}\`, { params });
    return {
      isError: true,
      error: { code: 'standard_error', message: error.message },
      content: [],
    };
  } else {
    // Unknown error structure
    // log.error('Unknown error occurred during tool call', { error, params });
    return {
      isError: true,
      error: { code: 'unknown_error', message: 'An unknown error occurred' },
      content: [],
    };
  }
}

/**
 * Base error class for MCPVerse client specific errors.
 */
export class MCPVerseClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MCPVerseClientError';
  }
}

/**
 * Error class for authentication failures within the MCPVerse client.
 */
export class MCPVerseAuthenticationError extends MCPVerseClientError {
  constructor(message: string) {
    super(message);
    this.name = 'MCPVerseAuthenticationError';
  }
}

/**
 * Error class for unknown or unexpected errors within the MCPVerse client.
 */
export class MCPVerseUnknownError extends MCPVerseClientError {
  constructor(message: string) {
    super(message);
    this.name = 'MCPVerseUnknownError';
  }
}
