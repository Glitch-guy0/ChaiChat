/**
 * Chat mode enumeration controlling LLM generation behavior.
 *
 * Each mode maps to a distinct temperature setting:
 * - `NORMAL` → temperature 0 (deterministic, focused)
 * - `DRUNK` → temperature 1.0 (creative, loose)
 *
 * @example
 * ```ts
 * const mode: ChatMode = ChatMode.NORMAL;
 * if (mode === ChatMode.DRUNK) {
 *   // apply loose temperature
 * }
 * ```
 */
export enum ChatMode {
  NORMAL = "normal",
  DRUNK = "drunk",
}
