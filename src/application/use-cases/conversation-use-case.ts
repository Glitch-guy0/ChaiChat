import type { IMessage } from "../../types";
import type { IChatSessionRepository, IMetricsLogger } from "../../ports";
import type { ConversationInput, IConversationUseCase } from "../ports";

/**
 * Implementation of {@link IConversationUseCase}.
 *
 * Returns the persisted conversation history for a session.
 * Missing or expired sessions return an empty array, not an error.
 *
 * Dependencies are injected via constructor — no internal instantiation.
 *
 * @example
 * ```ts
 * const useCase = new ConversationUseCase(sessionRepo, logger);
 * const messages = await useCase.getConversation({ tokenHash: "abc123" });
 * ```
 */
export class ConversationUseCase implements IConversationUseCase {
  constructor(
    private readonly sessionRepo: IChatSessionRepository,
    private readonly logger: IMetricsLogger,
  ) {}

  /** {@inheritDoc IConversationUseCase.getConversation} */
  async getConversation(input: ConversationInput): Promise<readonly IMessage[]> {
    try {
      const messages = await this.sessionRepo.getSession(input.tokenHash);

      try {
        await this.logger.logEvent({
          name: "conversation_loaded",
          properties: { tokenHash: input.tokenHash, messageCount: messages.length },
        });
      } catch {
        // Logging failure is non-critical
      }

      return messages;
    } catch {
      return [];
    }
  }
}
