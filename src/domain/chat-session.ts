import type { IMessage } from "../types";

/**
 * Domain aggregate representing a chat session.
 *
 * Holds the conversation history and expiration metadata.
 * Created during auth initialization, updated on each chat completion.
 *
 * @example
 * ```ts
 * const session = ChatSession.create("abc123", Date.now() + 3600_000);
 * session.appendMessage({ sender: "user", persona: "chai", content: "Hi" });
 * ```
 */
export class ChatSession {
  /**
   * Create a new ChatSession instance.
   *
   * @param id - Unique session identifier.
   * @param expiresAt - Unix timestamp (ms) when the session expires.
   * @param messages - Initial conversation messages (defaults to empty).
   * @returns A new ChatSession instance.
   *
   * @example
   * ```ts
   * const session = ChatSession.create("session-1", Date.now() + 3600_000);
   * session.messages; // []
   * ```
   */
  static create(id: string, expiresAt: number, messages: readonly IMessage[] = []): ChatSession {
    return new ChatSession(id, [...messages], expiresAt);
  }

  private constructor(
    public readonly id: string,
    public readonly messages: IMessage[],
    public readonly expiresAt: number,
  ) {}

  /**
   * Append a message to the conversation history.
   *
   * @param message - The message to append.
   *
   * @example
   * ```ts
   * session.appendMessage({
   *   sender: "assistant",
   *   persona: "chai",
   *   content: "Hello!",
   * });
   * ```
   */
  appendMessage(message: IMessage): void {
    this.messages.push(message);
  }

  /**
   * Check whether the session has expired.
   *
   * @returns `true` if the current time is past `expiresAt`.
   *
   * @example
   * ```ts
   * if (session.isExpired()) {
   *   // redirect to auth
   * }
   * ```
   */
  isExpired(): boolean {
    return Date.now() > this.expiresAt;
  }
}
