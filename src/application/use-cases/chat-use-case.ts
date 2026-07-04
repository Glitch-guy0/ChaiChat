import type { IMessage, ChatMode, IChatCompletionRequest } from "../../types";
import { ChatGenerationOptionsBuilder } from "../../types";
import type {
  IChatSessionRepository,
  ILLMService,
  IPersonaCatalog,
  IMetricsLogger,
} from "../../ports";
import type { ChatMessageInput, IChatUseCase } from "../ports";
import { ChatError, ChatErrorCode } from "../../errors";

/**
 * Implementation of {@link IChatUseCase}.
 *
 * Orchestrates the full chat flow: session load, persona resolution,
 * option building, LLM streaming, conversation persistence, and metrics.
 * Returns an async iterable of tokens for SSE delivery.
 *
 * Dependencies are injected via constructor — no internal instantiation.
 *
 * @example
 * ```ts
 * const useCase = new ChatUseCase(sessionRepo, llm, catalog, logger);
 * for await (const token of useCase.sendMessage(input)) {
 *   // stream token to client
 * }
 * ```
 */
export class ChatUseCase implements IChatUseCase {
  constructor(
    private readonly sessionRepo: IChatSessionRepository,
    private readonly llmService: ILLMService,
    private readonly personaCatalog: IPersonaCatalog,
    private readonly logger: IMetricsLogger,
  ) {}

  /** {@inheritDoc IChatUseCase.sendMessage} */
  async *sendMessage(input: ChatMessageInput): AsyncIterable<string> {
    const messages = await this.loadSession(input.tokenHash);
    const persona = await this.resolvePersona(input.personaId);
    const systemPrompt = await this.personaCatalog.getSystemPrompt(input.personaId);
    const options = this.buildOptions(input.mode);

    const userMessage: IMessage = {
      sender: "user",
      persona: input.personaId,
      content: input.prompt,
    };
    const updatedMessages = [...messages, userMessage];

    const request: IChatCompletionRequest = {
      systemPrompt,
      history: updatedMessages,
      activePersona: input.personaId,
      options,
    };

    let responseText = "";

    try {
      for await (const token of this.llmService.stream(request)) {
        responseText += token;
        yield token;
      }
    } catch (error) {
      try {
        await this.logger.logError({
          name: "chat_stream_failed",
          error: error instanceof Error ? error : new Error(String(error)),
          properties: { personaId: input.personaId, mode: input.mode },
        });
      } catch {
        // Logging failure is non-critical
      }
      throw new ChatError(
        ChatErrorCode.STREAM_INTERRUPTED,
        "Stream was interrupted",
        { cause: error instanceof Error ? error : undefined },
      );
    }

    const assistantMessage: IMessage = {
      sender: "assistant",
      persona: input.personaId,
      content: responseText,
    };
    const finalMessages = [...updatedMessages, assistantMessage];

    try {
      await this.sessionRepo.saveSession(input.tokenHash, finalMessages);
    } catch (error) {
      try {
        await this.logger.logError({
          name: "session_save_failed",
          error: error instanceof Error ? error : new Error(String(error)),
          properties: { tokenHash: input.tokenHash },
        });
      } catch {
        // Logging failure is non-critical
      }
    }

    try {
      await this.logger.logEvent({
        name: "chat_completed",
        properties: {
          personaId: input.personaId,
          mode: input.mode,
          responseLength: responseText.length,
        },
      });
    } catch {
      // Logging failure is non-critical
    }
  }

  /**
   * Load the conversation history from the session repository.
   *
   * @param tokenHash - The session key.
   * @returns The conversation messages, or empty array if no session.
   */
  private async loadSession(tokenHash: string): Promise<readonly IMessage[]> {
    try {
      return await this.sessionRepo.getSession(tokenHash);
    } catch {
      return [];
    }
  }

  /**
   * Resolve a persona by identifier.
   *
   * @param personaId - The persona identifier.
   * @returns The persona definition.
   * @throws {ChatError} If the persona is not found.
   */
  private async resolvePersona(personaId: string) {
    try {
      return await this.personaCatalog.getPersona(personaId);
    } catch {
      throw new ChatError(
        ChatErrorCode.PERSONA_NOT_FOUND,
        `Persona "${personaId}" not found`,
      );
    }
  }

  /**
   * Build generation options from a chat mode.
   *
   * @param mode - The chat mode.
   * @returns Immutable generation options.
   */
  private buildOptions(mode: ChatMode) {
    return new ChatGenerationOptionsBuilder().withMode(mode).build();
  }
}
