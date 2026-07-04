/**
 * Driven port for structured logging and metrics.
 *
 * Abstracts the logging backend (Pino, Datadog, Console) behind
 * a consistent contract. The application core logs events and errors
 * without knowing where they end up.
 *
 * @example
 * ```ts
 * // Usage in a use-case:
 * class AuthUseCase {
 *   constructor(private readonly logger: IMetricsLogger) {}
 *
 *   async initializeSession(...) {
 *     await this.logger.logEvent({
 *       name: "session_created",
 *       properties: { userId: "abc" },
 *     });
 *   }
 * }
 * ```
 */
export interface IMetricsLogger {
  /**
   * Log a structured event.
   *
   * @param event - The event to log.
   *
   * @example
   * ```ts
   * await logger.logEvent({
   *   name: "chat_completed",
   *   properties: { persona: "chai", tokens: 150 },
   * });
   * ```
   */
  logEvent(event: { readonly name: string; readonly properties?: Record<string, unknown> }): Promise<void>;

  /**
   * Log a structured error.
   *
   * @param error - The error to log.
   *
   * @example
   * ```ts
   * await logger.logError({
   *   name: "chat_failed",
   *   error: new Error("Provider unavailable"),
   *   properties: { persona: "chai" },
   * });
   * ```
   */
  logError(error: {
    readonly name: string;
    readonly error: Error;
    readonly properties?: Record<string, unknown>;
  }): Promise<void>;
}
