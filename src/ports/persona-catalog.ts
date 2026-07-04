import type { IPersonaDefinition } from "../types";

/**
 * Driven port for persona catalog access.
 *
 * Loads persona definitions and system prompts from configuration.
 * The application core depends on this interface, not on file-system
 * details or persona file format.
 *
 * @example
 * ```ts
 * // Usage in a use-case:
 * class ChatUseCase {
 *   constructor(private readonly personaCatalog: IPersonaCatalog) {}
 *
 *   async execute(personaId: string) {
 *     const persona = await this.personaCatalog.getPersona(personaId);
 *     const prompt = await this.personaCatalog.getSystemPrompt(personaId);
 *   }
 * }
 * ```
 */
export interface IPersonaCatalog {
  /**
   * Retrieve a persona definition by identifier.
   *
   * @param personaId - The unique persona identifier (e.g., `"chai"`).
   * @returns The persona definition.
   * @throws {Error} If the persona is not found.
   *
   * @example
   * ```ts
   * const persona = await catalog.getPersona("chai");
   * // { id: "chai", displayName: "Chai", systemPromptPath: "persona/chai.md" }
   * ```
   */
  getPersona(personaId: string): Promise<IPersonaDefinition>;

  /**
   * Load the system prompt content for a persona.
   *
   * @param personaId - The unique persona identifier.
   * @returns The system prompt as a string.
   * @throws {Error} If the persona or prompt file is not found.
   *
   * @example
   * ```ts
   * const prompt = await catalog.getSystemPrompt("chai");
   * // "You are Chai, a warm and wise conversationalist..."
   * ```
   */
  getSystemPrompt(personaId: string): Promise<string>;
}
