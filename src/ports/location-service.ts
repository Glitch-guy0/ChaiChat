import type { ILocationMetadata } from "../types";

/**
 * Driven port for IP geolocation.
 *
 * Resolves a client IP address to geographic metadata. Optional by
 * design — implementations degrade gracefully to `null` on failure.
 *
 * @example
 * ```ts
 * // Usage in a use-case:
 * class AuthUseCase {
 *   constructor(private readonly locationService: ILocationService) {}
 *
 *   async initializeSession(ip: string) {
 *     const location = await this.locationService.resolveLocation(ip);
 *     // location may be null if resolution fails
 *   }
 * }
 * ```
 */
export interface ILocationService {
  /**
   * Resolve geographic metadata from a client IP address.
   *
   * @param ip - The client IP address (e.g., `"192.168.1.1"`).
   * @returns Location metadata, or `null` if resolution fails.
   *
   * @example
   * ```ts
   * const location = await service.resolveLocation("203.0.113.42");
   * // { country: "India", regionName: "Karnataka", city: "Bengaluru" }
   * // or null
   * ```
   */
  resolveLocation(ip: string): Promise<ILocationMetadata | null>;
}
