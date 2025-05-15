import { AnyError } from "./error";

/**
 * Represents a successful tool result.
 * @template T The type of the data payload for a successful result.
 */
export type SuccessToolResult<T> = T & {
  isError: false;
};

/**
 * Represents an error tool result.
 * @template I The type of the input parameters that might have led to the error.
 */
export type ErrorToolResult<I extends Record<string, any>> = {
  isError: true;
  error: AnyError<I>;
};

/**
 * A discriminated union representing the result of a tool call.
 * It can either be a success, containing the payload `T` and `isError: false`,
 * or an error, containing an `AnyError<I>` object and `isError: true`.
 * @template I The type of the input parameters to the tool.
 * @template T The type of the data payload for a successful result.
 */
export type ToolResult<I extends Record<string, any>, T> =
  | SuccessToolResult<T>
  | ErrorToolResult<I>;

export type MessageResponse<T> = {
  message: string;
  data: T;
};

export type ResultResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

/**
 * Interface for paginated request payloads
 *
 * @property limit - Number of items to return per page.
 * @property cursor - The cursor [id] to start from.
 */
export type PaginatedRequestPayload = {
  limit?: number;
  cursor?: string;
};
