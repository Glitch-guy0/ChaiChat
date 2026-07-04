import type { IChatCompletionRequest } from "../types";

/**
 * Driven port for LLM interaction.
 *
 * Abstracts the LLM provider (OpenAI, Anthropic, local model) behind
 * a streaming contract. The use-case receives tokens via `AsyncIterable`
 * and never touches the provider SDK directly.
 *
 * @example
 * ```ts
 * // Usage in a use-case:
 * class ChatUseCase {
 *   constructor(private readonly llmService: ILLMService) {}
 *
 *   async execute(request: IChatCompletionRequest) {
 *     for await (const token of this.llmService.stream(request)) {
 *       // process token
 *     }
 *   }
 * }
 * ```
 */
export interface ILLMService {
  /**
   * Stream a completion from the LLM provider.
   *
   * Yields tokens as they are generated. The caller consumes the
   * stream and forwards tokens to the client via SSE.
   *
   * @param request - The completion request with system prompt, history, and options.
   * @returns An async iterable yielding token strings.
   *
   * @example
   * ```ts
   * const stream = llm.stream({
   *   systemPrompt: "You are Chai...",
   *   history: [],
   *   activePersona: "chai",
   *   options: { temperature: 0 },
   * });
   * for await (const token of stream) {
   *   process.stdout.write(token);
   * }
   * ```
   */
  stream(request: IChatCompletionRequest): AsyncIterable<string>;
}
