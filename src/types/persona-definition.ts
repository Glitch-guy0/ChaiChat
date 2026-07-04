/**
 * Contract for a persona definition loaded from configuration.
 *
 * Each persona is identified by a unique `id`, has a display name
 * shown in the UI, and references a file containing the system prompt
 * sent to the LLM.
 *
 * @example
 * ```ts
 * const persona: IPersonaDefinition = {
 *   id: "chai",
 *   displayName: "Chai",
 *   systemPromptPath: "persona/chai.md",
 * };
 * ```
 */
export interface IPersonaDefinition {
  /** Unique identifier for the persona (e.g., `"chai"`, `"espresso"`). */
  readonly id: string;

  /** Human-readable display name shown in the UI. */
  readonly displayName: string;

  /** Relative path to the markdown file containing the system prompt. */
  readonly systemPromptPath: string;
}
