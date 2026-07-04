import type { IMessage } from "./message";
import type { IChatGenerationOptions } from "./chat-generation-options";

/**
 * Bundles everything the LLM service needs to produce a completion.
 *
 * Constructed by the chat use-case after resolving the persona,
 * building generation options, and assembling conversation history.
 * Passed directly to {@link ILLMService.stream}.
 *
 * @example
 * ```ts
 * const request: IChatCompletionRequest = {
 *   systemPrompt: "You are a warm mentor...",
 *   history: [{ sender: "user", persona: "chai", content: "Hi" }],
 *   activePersona: "chai",
 *   options: { temperature: 0 },
 * };
 * ```
 */
export interface IChatCompletionRequest {
  /** The system prompt defining the persona's behavior. */
  readonly systemPrompt: string;

  /** Prior conversation messages for context. */
  readonly history: readonly IMessage[];

  /** Identifier of the active persona. */
  readonly activePersona: string;

  /** Generation options (temperature, etc.). */
  readonly options: IChatGenerationOptions;
}
