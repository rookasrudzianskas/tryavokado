import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  IntegrationSetupError,
  ExternalApiError,
  RateLimitError,
  RetryableJobError,
  NonRetryableJobError,
  isAppError,
  toErrorResponse,
} from "@/lib/errors";

describe("errors: error classes", () => {
  it("ValidationError → validation_error / 422 / not retryable", () => {
    const err = new ValidationError("Name is required");
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("validation_error");
    expect(err.httpStatus).toBe(422);
    expect(err.retryable).toBe(false);
    expect(err.userMessage).toBe("Name is required");
  });

  it("AuthenticationError → authentication_error / 401 / not retryable", () => {
    const err = new AuthenticationError();
    expect(err.code).toBe("authentication_error");
    expect(err.httpStatus).toBe(401);
    expect(err.retryable).toBe(false);
  });

  it("AuthorizationError → authorization_error / 403 / not retryable", () => {
    const err = new AuthorizationError();
    expect(err.code).toBe("authorization_error");
    expect(err.httpStatus).toBe(403);
    expect(err.retryable).toBe(false);
  });

  it("NotFoundError → not_found / 404 / not retryable", () => {
    const err = new NotFoundError();
    expect(err.code).toBe("not_found");
    expect(err.httpStatus).toBe(404);
    expect(err.retryable).toBe(false);
  });

  it("IntegrationSetupError → integration_setup_error / 400 / carries setup steps", () => {
    const steps = ["Connect Shopify", "Grant read_products"];
    const err = new IntegrationSetupError("Shopify is not connected", steps);
    expect(err.code).toBe("integration_setup_error");
    expect(err.httpStatus).toBe(400);
    expect(err.retryable).toBe(false);
    expect(err.setupSteps).toEqual(steps);
  });

  it("ExternalApiError → external_api_error / 502 / retryable is configurable", () => {
    const notRetryable = new ExternalApiError("Bad upstream response");
    expect(notRetryable.code).toBe("external_api_error");
    expect(notRetryable.httpStatus).toBe(502);
    expect(notRetryable.retryable).toBe(false);

    const retryable = new ExternalApiError("Upstream 503", undefined, true);
    expect(retryable.retryable).toBe(true);
  });

  it("RateLimitError → rate_limit_error / 429 / retryable with retryAfter", () => {
    const err = new RateLimitError();
    expect(err.code).toBe("rate_limit_error");
    expect(err.httpStatus).toBe(429);
    expect(err.retryable).toBe(true);
    expect(err.retryAfterSeconds).toBe(60);
  });

  it("RetryableJobError → retryable_job_error / 500 / retryable", () => {
    const err = new RetryableJobError("Transient failure");
    expect(err.code).toBe("retryable_job_error");
    expect(err.httpStatus).toBe(500);
    expect(err.retryable).toBe(true);
  });

  it("NonRetryableJobError → non_retryable_job_error / 500 / not retryable", () => {
    const err = new NonRetryableJobError("Permanent failure");
    expect(err.code).toBe("non_retryable_job_error");
    expect(err.httpStatus).toBe(500);
    expect(err.retryable).toBe(false);
  });

  it("AppError defaults to 500 / not retryable when unspecified", () => {
    const err = new AppError({ code: "internal_error", message: "boom" });
    expect(err.httpStatus).toBe(500);
    expect(err.retryable).toBe(false);
    expect(err.userMessage).toBe("boom");
  });

  it("subclass instances set name to the subclass constructor name", () => {
    expect(new ValidationError("x").name).toBe("ValidationError");
    expect(new NotFoundError().name).toBe("NotFoundError");
  });

  it("toJSON exposes only code and the user-facing message", () => {
    const err = new ValidationError("Email is invalid");
    expect(err.toJSON()).toEqual({
      code: "validation_error",
      message: "Email is invalid",
    });
  });
});

describe("errors: isAppError", () => {
  it("is true for AppError and its subclasses", () => {
    expect(isAppError(new AppError({ code: "internal_error", message: "x" }))).toBe(true);
    expect(isAppError(new ValidationError("x"))).toBe(true);
    expect(isAppError(new RateLimitError())).toBe(true);
  });

  it("is false for plain errors and non-errors", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
    expect(isAppError("just a string")).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError({ code: "validation_error" })).toBe(false);
  });
});

describe("errors: toErrorResponse", () => {
  it("maps an AppError to { code, message, httpStatus } using the user message", () => {
    const err = new AuthorizationError("Nope, not allowed.");
    expect(toErrorResponse(err)).toEqual({
      code: "authorization_error",
      message: "Nope, not allowed.",
      httpStatus: 403,
    });
  });

  it("maps a subclass with a custom user message", () => {
    const err = new ExternalApiError("raw upstream detail");
    const res = toErrorResponse(err);
    expect(res.code).toBe("external_api_error");
    expect(res.httpStatus).toBe(502);
    // The safe user message is surfaced, not the raw internal message.
    expect(res.message).toBe(
      "The external service returned an error. We've logged the details.",
    );
  });

  it("maps unknown thrown values to internal_error / 500 with a safe message", () => {
    const fromError = toErrorResponse(new Error("stack-trace-y details"));
    expect(fromError).toEqual({
      code: "internal_error",
      message: "Something went wrong on our side. Please try again.",
      httpStatus: 500,
    });

    expect(toErrorResponse("a bare string").code).toBe("internal_error");
    expect(toErrorResponse(null).httpStatus).toBe(500);
    expect(toErrorResponse(undefined).code).toBe("internal_error");
  });
});
