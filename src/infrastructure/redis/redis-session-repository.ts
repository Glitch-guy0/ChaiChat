import Redis from "ioredis";
import type { IMessage } from "../../types";
import type { IChatSessionRepository } from "../../ports";

/**
 * Redis-backed implementation of {@link IChatSessionRepository}.
 *
 * Stores conversation history as serialized JSON with a configurable TTL.
 * Each session is keyed by the JWT-derived token hash.
 *
 * @example
 * ```ts
 * const repo = new RedisSessionRepository("redis://localhost:6379", 3600);
 * await repo.saveSession("hash123", [{ sender: "user", persona: "chai", content: "Hi" }]);
 * const messages = await repo.getSession("hash123");
 * ```
 */
export class RedisSessionRepository implements IChatSessionRepository {
  private readonly client: Redis;
  private readonly ttlSeconds: number;

  /**
   * Create a new Redis session repository.
   *
   * @param redisUrl - The Redis connection URL.
   * @param ttlSeconds - Session TTL in seconds (default: 3600 = 1 hour).
   *
   * @example
   * ```ts
   * const repo = new RedisSessionRepository("redis://localhost:6379", 3600);
   * ```
   */
  constructor(redisUrl: string, ttlSeconds: number = 3600) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    this.ttlSeconds = ttlSeconds;
  }

  /**
   * Retrieve conversation history for a session.
   *
   * @param tokenHash - The JWT-derived session key.
   * @returns The messages, or an empty array if no session exists.
   *
   * @example
   * ```ts
   * const messages = await repo.getSession("user-1:1720000000");
   * // [] or [{ sender: "user", persona: "chai", content: "Hi" }]
   * ```
   */
  async getSession(tokenHash: string): Promise<readonly IMessage[]> {
    const data = await this.client.get(tokenHash);
    if (!data) return [];
    try {
      return JSON.parse(data) as IMessage[];
    } catch {
      return [];
    }
  }

  /**
   * Persist conversation history for a session.
   *
   * Overwrites any existing conversation. Sets TTL aligned with JWT expiry.
   *
   * @param tokenHash - The JWT-derived session key.
   * @param conversation - The messages to persist.
   *
   * @example
   * ```ts
   * await repo.saveSession("user-1:1720000000", [
   *   { sender: "user", persona: "chai", content: "Hi" },
   * ]);
   * ```
   */
  async saveSession(tokenHash: string, conversation: readonly IMessage[]): Promise<void> {
    await this.client.setex(tokenHash, this.ttlSeconds, JSON.stringify(conversation));
  }

  /**
   * Close the Redis connection.
   *
   * Call during application shutdown to drain pending commands.
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
