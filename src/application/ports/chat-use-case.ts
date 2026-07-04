import type { ChatMode } from "../../types";

/**
 * Input for sending a chat message.
 *
 * Bundles the token hash (for session lookup), the user's prompt,
 * the active persona, and the chat mode.
 *
 * @example
 * ```ts
 * const input: ChatMessageInput = {
 *   tokenHash: "sha256-of-jwt",
 *   prompt: "Tell me about chai",
 *   personaId: "chai",
 *   mode: ChatMode.NORMAL,
 * };
 * ```
 */
export interface ChatMessageInput {
  /** JWT-derived hash identifying the session. */
  readonly tokenHash: string;

  /** The user's message content. */
  readonly prompt: string;

  /** The active persona identifier. */
  readonly personaId: string;

  /** The chat mode (normal or drunk). */
  readonly mode: ChatMode;
}

/**
 * Primary port for chat message processing.
 *
 * Orchestrates session loading, persona resolution, option building,
 * LLM streaming, conversation persistence, and metrics logging.
 * Returns an async iterable of tokens for SSE delivery.
 *
 * @example
 * ```ts
 * class ChatUseCase implements IChatUseCase {
 *   constructor(private readonly llmService: ILLMService) {}
 *
 *   async *sendMessage(input: ChatMessageInput) {
 *     for await (const token of this.llmService.stream(request)) {
 *       yield token;
 *     }
 *   }
 * }
 * ```
 */
export interface IChatUseCase {
  /**
   * Send a message and stream the AI response.
   *
   * Loads the session, resolves the persona and mode, streams tokens
   * from the LLM, persists the updated conversation, and logs metrics.
   *
   * @param input - The chat message input.
   * @returns An async iterable yielding response tokens.
   *
   * @example
   * ```ts
   * for await (const token of chatUseCase.sendMessage({
   *   tokenHash: "abc123",
   *   prompt: "Hello!",
   *   personaId: "chai",
   *   mode: ChatMode.NORMAL,
   * })) {
   *   // stream token to client
   * }
   * ```
   */
  sendMessage(input: ChatMessageInput): AsyncIterable<string>;
}
