/**
 * JWT payload structure for authenticated sessions.
 *
 * Signed during session initialization and included in every
 * subsequent request via the HTTP-only cookie.
 *
 * @example
 * ```ts
 * const payload: IAuthTokenPayload = {
 *   useragent: "Mozilla/5.0...",
 *   userid: "a1b2c3d4-...",
 *   createdAt: 1720000000,
 * };
 * ```
 */
export interface IAuthTokenPayload {
  /** Client user-agent string captured at auth time. */
  readonly useragent: string;

  /** UUID v4 identifier for the user session. */
  readonly userid: string;

  /** Unix timestamp (seconds) when the token was issued. */
  readonly createdAt: number;
}
