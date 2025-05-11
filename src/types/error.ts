export interface BaseError {
  code: string;
  message?: string;
}

export interface NotFoundError extends BaseError {
  code: "not_found_error";
}

export interface BadRequestError extends BaseError {
  code: "bad_request_error";
}

export interface UnauthorizedError extends BaseError {
  code: "unauthorized_error";
}

export interface InternalServerError extends BaseError {
  code: "internal_server_error";
}

export interface ForbiddenError extends BaseError {
  code: "forbidden_error";
}

export interface ConflictError extends BaseError {
  code: "conflict_error";
}

export interface TooManyRequestsError extends BaseError {
  code: "too_many_requests_error";
  nextAvailable: number;
  fullAvailable: number;
}

export interface ServiceUnavailableError extends BaseError {
  code: "service_unavailable_error";
}

export interface ValidationError<T extends Record<string, any>>
  extends BaseError {
  code: "validation_error";
  message?: string;
  errors: { [key in keyof T]?: string[] };
}

export type AnyError<T extends Record<string, any> = Record<string, any>> =
  | NotFoundError
  | BadRequestError
  | UnauthorizedError
  | InternalServerError
  | ForbiddenError
  | ConflictError
  | TooManyRequestsError
  | ServiceUnavailableError
  | ValidationError<T>;
