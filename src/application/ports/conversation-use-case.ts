import type { IMessage } from "../../types";

/**
 * Input for fetching conversation history.
 *
 * @example
 * ```ts
 * const input: ConversationInput = {
 *   tokenHash: "sha256-of-jwt",
 * };
 * ```
 */
export interface ConversationInput {
  /** JWT-derived hash identifying the session. */
  readonly tokenHash: string;
}

/**
 * Primary port for conversation retrieval.
 *
 * Returns the persisted conversation history for a session.
 * Missing or expired sessions return an empty array, not an error.
 *
 * @example
 * ```ts
 * class ConversationUseCase implements IConversationUseCase {
 *   constructor(private readonly sessionRepo: IChatSessionRepository) {}
 *
 *   async getConversation(input: ConversationInput): Promise<readonly IMessage[]> {
 *     return this.sessionRepo.getSession(input.tokenHash);
 *   }
 * }
 * ```
 */
export interface IConversationUseCase {
  /**
   * Retrieve the conversation history for a session.
   *
   * @param input - The conversation input with token hash.
   * @returns The conversation messages, or an empty array if no session exists.
   *
   * @example
   * ```ts
   * const messages = await conversationUseCase.getConversation({
   *   tokenHash: "abc123",
   * });
   * ```
   */
  getConversation(input: ConversationInput): Promise<readonly IMessage[]>;
}
