import type { ILocationMetadata } from "../../types";
import type { ILocationService } from "../../ports";

/**
 * IP-API.com implementation of {@link ILocationService}.
 *
 * Resolves client IP addresses to geographic metadata using
 * the free ip-api.com JSON endpoint. Degrades gracefully to
 * `null` on any failure.
 *
 * @example
 * ```ts
 * const service = new IpApiLocationService();
 * const location = await service.resolveLocation("203.0.113.42");
 * // { country: "India", regionName: "Karnataka", city: "Bengaluru" }
 * ```
 */
export class IpApiLocationService implements ILocationService {
  private readonly baseUrl = "http://ip-api.com/json";

  /** {@inheritDoc ILocationService.resolveLocation} */
  async resolveLocation(ip: string): Promise<ILocationMetadata | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${ip}?fields=country,regionName,city`, {
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as {
        status?: string;
        country?: string;
        regionName?: string;
        city?: string;
      };

      if (data.status !== "success" || !data.country || !data.regionName || !data.city) {
        return null;
      }

      return {
        country: data.country,
        regionName: data.regionName,
        city: data.city,
      };
    } catch {
      return null;
    }
  }
}
