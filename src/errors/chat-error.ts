/**
 * Base class for all chat-related errors.
 *
 * Extends `Error` with a structured `code` property for typed
 * error handling at the route adapter boundary.
 *
 * @example
 * ```ts
 * throw new ChatError(ChatErrorCode.LLM_PROVIDER_ERROR, "OpenAI unavailable");
 * ```
 */
export class ChatError extends Error {
  constructor(
    public readonly code: ChatErrorCode,
    message: string,
    options?: { readonly cause?: Error },
  ) {
    super(message, options);
    this.name = "ChatError";
  }
}

/**
 * Typed error codes for chat failures.
 *
 * Each code maps to a specific failure scenario, enabling
 * the route adapter to return appropriate HTTP status codes.
 *
 * @example
 * ```ts
 * if (error.code === ChatErrorCode.LLM_PROVIDER_ERROR) {
 *   return new Response("Bad Gateway", { status: 502 });
 * }
 * ```
 */
export enum ChatErrorCode {
  /** LLM provider failed before response started. */
  LLM_PROVIDER_ERROR = "LLM_PROVIDER_ERROR",

  /** Stream interrupted mid-response. */
  STREAM_INTERRUPTED = "STREAM_INTERRUPTED",

  /** Session not found or expired. */
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",

  /** Token counting failed. */
  TOKEN_COUNT_ERROR = "TOKEN_COUNT_ERROR",

  /** Persona not found in catalog. */
  PERSONA_NOT_FOUND = "PERSONA_NOT_FOUND",

  /** Session save failed after successful stream. */
  SESSION_SAVE_FAILED = "SESSION_SAVE_FAILED",
}
