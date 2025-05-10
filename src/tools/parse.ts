import {
  CallToolResult,
  JSONRPCError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types'; // Import CallToolResult
import { Logger } from '../core/logger/interface.js';
import { ToolResult, AnyError } from '../types/index.js';

/**
 * Parses the result of a tool call from the MCP SDK into a standardized ToolResult format.
 * It handles various error conditions, including MCP transport errors and content parsing issues,
 * mapping them to specific error types defined in `AnyError`.
 *
 * @template I The type of the input arguments that were sent to the tool.
 * @template T The expected type of the successfully parsed content from the tool.
 * @param callResult The raw result object from `client.callTool`.
 * @param toolName The name of the tool that was called, for logging purposes.
 * @param log A logger instance.
 * @param inputParams Optional input parameters, used for enriching error messages or for ValidationError.
 * @returns A `ToolResult<I, T>` object, which includes the parsed data or error information.
 */
export function parseToolResult<I extends Record<string, any>, T>(
  callResult: CallToolResult,
  toolName: string,
  log: Logger,
  inputParams?: I
): ToolResult<I, T> {
  log.debug(
    `[MCPClient] Parsing tool result for tool: ${toolName}`,
    callResult
  );

  if (callResult.isError && callResult.error) {
    const sdkError = callResult.error as JSONRPCError['error'];
    const sdkErrorCode = sdkError.code as ErrorCode;
    let specificError: AnyError<I>;

    switch (sdkErrorCode) {
      case ErrorCode.ConnectionClosed:
        specificError = {
          code: 'service_unavailable_error',
          message: sdkError.message || 'Connection closed.',
        };
        break;
      case ErrorCode.InternalError:
        specificError = {
          code: 'internal_server_error',
          message: sdkError.message || 'SDK Internal Error.',
        };
        break;
      case ErrorCode.InvalidRequest:
        specificError = {
          code: 'bad_request_error',
          message: sdkError.message || 'SDK: Invalid request.',
        };
        break;
      case ErrorCode.MethodNotFound:
        specificError = {
          code: 'not_found_error',
          message: sdkError.message || `Method ${toolName} not found via SDK.`,
        };
        break;
      case ErrorCode.ParseError: // SDK failed to parse a response/request it received/sent
        specificError = {
          code: 'internal_server_error',
          message: sdkError.message || 'SDK Parse Error.',
        };
        break;
      case ErrorCode.InvalidParams:
        // Attempt to map sdkError.data to ValidationError structure if possible
        const errors: { [key in keyof I]?: string[] } = {};
        if (typeof sdkError.data === 'object' && sdkError.data !== null) {
          // This is a heuristic; actual sdkError.data structure for InvalidParams needs to be known
          for (const key in inputParams) {
            if (Object.prototype.hasOwnProperty.call(sdkError.data, key)) {
              const errorVal = (sdkError.data as any)[key];
              errors[key] = Array.isArray(errorVal)
                ? errorVal
                : [String(errorVal)];
            }
          }
        }
        specificError = {
          code: 'validation_error',
          message: sdkError.message || 'Invalid parameters provided to SDK.',
          errors:
            Object.keys(errors).length > 0
              ? errors
              : {
                  _general: [sdkError.message || 'Parameter validation failed'],
                },
        };
        break;
      case ErrorCode.RequestTimeout:
        specificError = {
          code: 'service_unavailable_error',
          message: sdkError.message || 'Request timed out.',
        };
        break;
      default:
        specificError = {
          code: 'internal_server_error',
          message:
            sdkError.message ||
            `Unknown SDK error occurred (code: ${sdkError.code}).`,
        };
    }
    log.warn(
      `[MCPClient] SDK Error for tool ${toolName}: ${specificError.code} - ${specificError.message}`,
      sdkError.data
    );
    return { isError: true, error: specificError };
  }

  if (callResult.content.length === 0) {
    log.warn(`[MCPClient] No content returned from tool ${toolName}`);
    return {
      isError: true,
      error: {
        code: 'not_found_error',
        message: `No content returned from tool ${toolName}.`,
      },
    };
  }

  const contentItem = callResult.content[0];
  if (typeof contentItem?.text !== 'string') {
    log.warn(
      `[MCPClient] Content is not a string or missing for tool ${toolName}`,
      contentItem
    );
    return {
      isError: true,
      error: {
        code: 'bad_request_error',
        message: `Content from tool ${toolName} is not a string or is missing. Details: ${JSON.stringify(contentItem)}`,
      },
    };
  }
  const contentStr = contentItem.text;

  if (callResult.isError) {
    // SDK flagged isError, but not via callResult.error (e.g. tool itself returned an error string)
    log.warn(
      `[MCPClient] Tool ${toolName} indicated an error. Content: ${contentStr}`
    );
    let errorDetails: unknown = contentStr;
    try {
      const parsedJson = JSON.parse(contentStr);
      // Check if parsedJson itself is one of our specific error types
      if (
        parsedJson &&
        typeof parsedJson.code === 'string' &&
        'message' in parsedJson
      ) {
        // Basic check for AnyError like structure. More specific checks could be added.
        // For now, we wrap it rather than casting directly to avoid issues if it's not a perfect match.
        errorDetails = parsedJson;
      }
    } catch (e) {
      /* Not JSON, use raw string as detail */
    }

    return {
      isError: true,
      error: {
        code: 'internal_server_error', // Or a more specific code if derivable from errorDetails
        message: `Tool ${toolName} reported an error. Details: ${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)}`,
      },
    };
  }

  // If not an SDK error and not a tool-indicated error, try to parse as successful content
  try {
    const parsedData = JSON.parse(contentStr) as T;
    return { ...parsedData, isError: false };
  } catch (parseError: any) {
    log.error(
      `[MCPClient] Failed to parse successful content for tool ${toolName}: ${parseError.message}`,
      { contentStr }
    );
    return {
      isError: true,
      error: {
        code: 'internal_server_error', // Server returned success, but content was unparsable by client
        message: `Failed to parse successful content from tool ${toolName}. Details: ${parseError.message}. Raw content: ${contentStr.substring(0, 100)}...`,
      },
    };
  }
}
