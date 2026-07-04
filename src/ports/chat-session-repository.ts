import type { IMessage } from "../types";

/**
 * Driven port for session persistence.
 *
 * Abstracts the storage mechanism (Redis, SQLite, in-memory) behind
 * a clean contract. The application core depends on this interface,
 * not on any concrete repository.
 *
 * @example
 * ```ts
 * // Usage in a use-case:
 * class ChatUseCase {
 *   constructor(private readonly sessionRepo: IChatSessionRepository) {}
 *
 *   async execute(tokenHash: string) {
 *     const messages = await this.sessionRepo.getSession(tokenHash);
 *     // ...
 *   }
 * }
 * ```
 */
export interface IChatSessionRepository {
  /**
   * Retrieve the conversation history for a session.
   *
   * @param tokenHash - The JWT-derived hash identifying the session.
   * @returns The conversation messages, or an empty array if no session exists.
   *
   * @example
   * ```ts
   * const messages = await repo.getSession("abc123");
   * // [] or [{ sender: "user", persona: "chai", content: "Hi" }]
   * ```
   */
  getSession(tokenHash: string): Promise<readonly IMessage[]>;

  /**
   * Persist the conversation history for a session.
   *
   * Overwrites any existing conversation for the given token hash.
   * Implementations should enforce a 1-hour TTL aligned with JWT expiry.
   *
   * @param tokenHash - The JWT-derived hash identifying the session.
   * @param conversation - The messages to persist.
   *
   * @example
   * ```ts
   * await repo.saveSession("abc123", [
   *   { sender: "user", persona: "chai", content: "Hi" },
   *   { sender: "assistant", persona: "chai", content: "Hello!" },
   * ]);
   * ```
   */
  saveSession(tokenHash: string, conversation: readonly IMessage[]): Promise<void>;
}
