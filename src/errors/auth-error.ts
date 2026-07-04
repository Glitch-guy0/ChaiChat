/**
 * Base class for all authentication-related errors.
 *
 * Extends `Error` with a structured `code` property for typed
 * error handling at the route adapter boundary.
 *
 * @example
 * ```ts
 * throw new AuthError(AuthErrorCode.JWT_SIGN_FAILED, "HMAC key missing");
 * ```
 */
export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message: string,
    options?: { readonly cause?: Error },
  ) {
    super(message, options);
    this.name = "AuthError";
  }
}

/**
 * Typed error codes for authentication failures.
 *
 * Each code maps to a specific failure scenario, enabling
 * the route adapter to return appropriate HTTP status codes.
 *
 * @example
 * ```ts
 * if (error.code === AuthErrorCode.REDIS_CONNECTION_FAILED) {
 *   return new Response("Service unavailable", { status: 502 });
 * }
 * ```
 */
export enum AuthErrorCode {
  /** JWT signing failed (missing key, crypto error). */
  JWT_SIGN_FAILED = "JWT_SIGN_FAILED",

  /** Redis connection or operation failed. */
  REDIS_CONNECTION_FAILED = "REDIS_CONNECTION_FAILED",

  /** Session not found in storage. */
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",

  /** Session has expired. */
  SESSION_EXPIRED = "SESSION_EXPIRED",

  /** Location resolution failed (non-critical, degrades to null). */
  LOCATION_RESOLUTION_FAILED = "LOCATION_RESOLUTION_FAILED",
}
