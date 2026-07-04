import { ChatMode } from "./chat-mode";

/**
 * Immutable options controlling LLM generation behavior.
 *
 * Produced by {@link IChatGenerationOptionsBuilder}. New options are added
 * here rather than changing the use-case signature — the builder absorbs
 * the complexity.
 *
 * @example
 * ```ts
 * const options: IChatGenerationOptions = { temperature: 0 };
 * ```
 */
export interface IChatGenerationOptions {
  /** Sampling temperature. 0 = deterministic, higher = more random. */
  readonly temperature: number;
}

/**
 * Mutable state accumulated during the builder lifecycle.
 *
 * @internal — not part of the public contract.
 */
export interface ChatGenerationOptionsBuilderState {
  mode: ChatMode;
}

/**
 * Builder contract for constructing {@link IChatGenerationOptions}.
 *
 * The builder pattern keeps generation options extensible — adding
 * `maxTokens`, `topP`, or future parameters extends the builder,
 * not the use-case signature.
 *
 * @example
 * ```ts
 * const builder: IChatGenerationOptionsBuilder = new ChatGenerationOptionsBuilder();
 * const options = builder
 *   .withMode(ChatMode.DRUNK)
 *   .build();
 * // options.temperature === 1.0
 * ```
 */
export interface IChatGenerationOptionsBuilder {
  /**
   * Set the chat mode for generation.
   *
   * @param mode - The chat mode to apply.
   * @returns The builder instance for chaining.
   */
  withMode(mode: ChatMode): IChatGenerationOptionsBuilder;

  /**
   * Produce an immutable options object from the accumulated state.
   *
   * @returns Immutable generation options.
   */
  build(): IChatGenerationOptions;
}

/**
 * Concrete builder that maps {@link ChatMode} to generation options.
 *
 * Follows the builder pattern — accumulate state via chained calls,
 * then freeze into an immutable result with {@link build}.
 *
 * @example
 * ```ts
 * const options = new ChatGenerationOptionsBuilder()
 *   .withMode(ChatMode.NORMAL)
 *   .build();
 * // { temperature: 0 }
 * ```
 */
export class ChatGenerationOptionsBuilder implements IChatGenerationOptionsBuilder {
  private readonly state: ChatGenerationOptionsBuilderState;

  constructor() {
    this.state = { mode: ChatMode.NORMAL };
  }

  /** {@inheritDoc IChatGenerationOptionsBuilder.withMode} */
  withMode(mode: ChatMode): IChatGenerationOptionsBuilder {
    this.state.mode = mode;
    return this;
  }

  /** {@inheritDoc IChatGenerationOptionsBuilder.build} */
  build(): IChatGenerationOptions {
    return Object.freeze({
      temperature: this.mapModeToTemperature(this.state.mode),
    });
  }

  /**
   * Map a chat mode to its corresponding temperature value.
   *
   * @param mode - The chat mode.
   * @returns The temperature for that mode.
   */
  private mapModeToTemperature(mode: ChatMode): number {
    switch (mode) {
      case ChatMode.NORMAL:
        return 0;
      case ChatMode.DRUNK:
        return 1.0;
    }
  }
}
