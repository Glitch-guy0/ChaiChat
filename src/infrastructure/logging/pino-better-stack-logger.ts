import pino from "pino";
import type { IMetricsLogger } from "../../ports";

/**
 * Pino-backed implementation of {@link IMetricsLogger}.
 *
 * Emits structured JSON logs. In production, logs are forwarded
 * to Better Stack via the configured transport. In development,
 * `pino-pretty` formats output for readability.
 *
 * @example
 * ```ts
 * const logger = new PinoBetterStackLogger("production");
 * await logger.logEvent({ name: "session_created", properties: { userId: "123" } });
 * ```
 */
export class PinoBetterStackLogger implements IMetricsLogger {
  private readonly logger: pino.Logger;

  /**
   * Create a new Pino logger.
   *
   * @param nodeEnv - The environment (`"production"` or `"development"`).
   * @param betterStackToken - Optional Better Stack source token for log forwarding.
   *
   * @example
   * ```ts
   * const logger = new PinoBetterStackLogger("production", "bstk-token-...");
   * ```
   */
  constructor(nodeEnv: string = "development", betterStackToken?: string) {
    const transport =
      nodeEnv === "production" && betterStackToken
        ? {
            target: "pino-http-transport",
            options: {
              baseUrl: "https://in.logs.betterstack.com",
              headers: {
                Authorization: `Bearer ${betterStackToken}`,
              },
            },
          }
        : nodeEnv !== "production"
          ? { target: "pino-pretty" }
          : undefined;

    this.logger = pino({
      level: nodeEnv === "production" ? "info" : "debug",
      transport,
    });
  }

  /** {@inheritDoc IMetricsLogger.logEvent} */
  async logEvent(event: {
    readonly name: string;
    readonly properties?: Record<string, unknown>;
  }): Promise<void> {
    this.logger.info({ event: event.name, ...event.properties }, event.name);
  }

  /** {@inheritDoc IMetricsLogger.logError} */
  async logError(error: {
    readonly name: string;
    readonly error: Error;
    readonly properties?: Record<string, unknown>;
  }): Promise<void> {
    this.logger.error(
      {
        event: error.name,
        error: {
          message: error.error.message,
          stack: error.error.stack,
          name: error.error.name,
        },
        ...error.properties,
      },
      error.name,
    );
  }
}
