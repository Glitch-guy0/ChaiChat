/**
 * A single message in a conversation.
 *
 * Represents either a user contribution or an AI-generated response.
 * Each message carries the persona identifier that produced it,
 * enabling persona-aware history restoration.
 *
 * @example
 * ```ts
 * const msg: IMessage = {
 *   sender: "user",
 *   persona: "chai",
 *   content: "Hello, how are you?",
 * };
 * ```
 */
export interface IMessage {
  /** Message sender type — either `"user"` or `"assistant"`. */
  readonly sender: "user" | "assistant";

  /** Identifier of the persona that generated this message. */
  readonly persona: string;

  /** The textual content of the message. */
  readonly content: string;
}
