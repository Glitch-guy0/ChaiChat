/**
 * Optional geolocation metadata resolved from a client IP address.
 *
 * Resolved via `ip-api.com` during auth. If resolution fails,
 * the field is `null` — this is a graceful degradation, not an error.
 *
 * @example
 * ```ts
 * const location: ILocationMetadata = {
 *   country: "India",
 *   regionName: "Karnataka",
 *   city: "Bengaluru",
 * };
 * ```
 */
export interface ILocationMetadata {
  /** Country name (e.g., `"India"`). */
  readonly country: string;

  /** Region or state name (e.g., `"Karnataka"`). */
  readonly regionName: string;

  /** City name (e.g., `"Bengaluru"`). */
  readonly city: string;
}
