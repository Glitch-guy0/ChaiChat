import { v4 as uuidv4 } from "uuid";
import type { IChatSessionRepository, ILocationService, IMetricsLogger } from "../../ports";
import type { AuthSessionInput, AuthSessionResult, IAuthUseCase } from "../ports";
import { AuthError, AuthErrorCode } from "../../errors";

/**
 * Implementation of {@link IAuthUseCase}.
 *
 * Orchestrates session initialization: generates a user ID, resolves
 * location, persists the session, and returns the token hash for JWT signing.
 *
 * Dependencies are injected via constructor — no internal instantiation.
 *
 * @example
 * ```ts
 * const useCase = new AuthUseCase(sessionRepo, locationService, logger);
 * const result = await useCase.initializeSession({
 *   userId: "a1b2c3d4-...",
 *   userAgent: "Mozilla/5.0...",
 *   ip: "203.0.113.42",
 * });
 * ```
 */
export class AuthUseCase implements IAuthUseCase {
  constructor(
    private readonly sessionRepo: IChatSessionRepository,
    private readonly locationService: ILocationService,
    private readonly logger: IMetricsLogger,
  ) {}

  /** {@inheritDoc IAuthUseCase.initializeSession} */
  async initializeSession(input: AuthSessionInput): Promise<AuthSessionResult> {
    const tokenHash = this.deriveTokenHash(input.userId);

    let location = null;
    try {
      location = await this.locationService.resolveLocation(input.ip);
    } catch {
      // Location resolution is optional — degrade gracefully
    }

    try {
      await this.sessionRepo.saveSession(tokenHash, []);
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.REDIS_CONNECTION_FAILED,
        "Failed to persist session",
        { cause: error instanceof Error ? error : undefined },
      );
    }

    try {
      await this.logger.logEvent({
        name: "session_created",
        properties: { userId: input.userId, tokenHash, location },
      });
    } catch {
      // Logging failure is non-critical — swallow
    }

    return { tokenHash, location };
  }

  /**
   * Derive a session key from a user ID.
   *
   * @param userId - The UUID v4 user identifier.
   * @returns A deterministic hash for session storage.
   */
  private deriveTokenHash(userId: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `${userId}:${timestamp}`;
  }
}
