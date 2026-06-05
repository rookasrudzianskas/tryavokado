/**
 * Standardized application errors. Each carries a stable `code`, an HTTP status,
 * a safe `userMessage` for the UI, and optional internal `details` that must NOT
 * be shown to end users.
 */

export type ErrorCode =
  | "validation_error"
  | "authentication_error"
  | "authorization_error"
  | "not_found"
  | "integration_setup_error"
  | "external_api_error"
  | "rate_limit_error"
  | "retryable_job_error"
  | "non_retryable_job_error"
  | "conflict"
  | "internal_error";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly userMessage: string;
  readonly details?: unknown;
  readonly retryable: boolean;

  constructor(opts: {
    code: ErrorCode;
    message: string;
    userMessage?: string;
    httpStatus?: number;
    details?: unknown;
    retryable?: boolean;
  }) {
    super(opts.message);
    this.name = new.target.name;
    this.code = opts.code;
    this.httpStatus = opts.httpStatus ?? 500;
    this.userMessage = opts.userMessage ?? opts.message;
    this.details = opts.details;
    this.retryable = opts.retryable ?? false;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.userMessage,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      code: "validation_error",
      message,
      userMessage: message,
      httpStatus: 422,
      details,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "You need to sign in to continue.") {
    super({
      code: "authentication_error",
      message,
      httpStatus: 401,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to do that.") {
    super({
      code: "authorization_error",
      message,
      httpStatus: 403,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.") {
    super({ code: "not_found", message, httpStatus: 404 });
  }
}

export class IntegrationSetupError extends AppError {
  constructor(
    message: string,
    public readonly setupSteps: string[] = [],
  ) {
    super({
      code: "integration_setup_error",
      message,
      userMessage: message,
      httpStatus: 400,
      details: { setupSteps },
    });
  }
}

export class ExternalApiError extends AppError {
  constructor(message: string, details?: unknown, retryable = false) {
    super({
      code: "external_api_error",
      message,
      userMessage:
        "The external service returned an error. We've logged the details.",
      httpStatus: 502,
      details,
      retryable,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests. Please slow down.",
    public readonly retryAfterSeconds = 60,
  ) {
    super({
      code: "rate_limit_error",
      message,
      httpStatus: 429,
      details: { retryAfterSeconds },
      retryable: true,
    });
  }
}

export class RetryableJobError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      code: "retryable_job_error",
      message,
      httpStatus: 500,
      details,
      retryable: true,
    });
  }
}

export class NonRetryableJobError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      code: "non_retryable_job_error",
      message,
      httpStatus: 500,
      details,
      retryable: false,
    });
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** Convert any thrown value into a safe, user-facing payload. */
export function toErrorResponse(err: unknown): {
  code: ErrorCode;
  message: string;
  httpStatus: number;
} {
  if (isAppError(err)) {
    return {
      code: err.code,
      message: err.userMessage,
      httpStatus: err.httpStatus,
    };
  }
  return {
    code: "internal_error",
    message: "Something went wrong on our side. Please try again.",
    httpStatus: 500,
  };
}
