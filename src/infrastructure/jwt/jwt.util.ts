import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { IAuthTokenPayload } from "../../types";

/**
 * Extended JWT payload including the token hash for session lookup.
 *
 * @example
 * ```ts
 * const payload: ChaiChatJWTPayload = {
 *   sub: "token-hash",
 *   userid: "a1b2c3d4-...",
 *   useragent: "Mozilla/5.0...",
 *   createdAt: 1720000000,
 * };
 * ```
 */
export interface ChaiChatJWTPayload extends JWTPayload {
  /** Token hash used as the session key in Redis. */
  readonly sub: string;

  /** UUID v4 user identifier. */
  readonly userid: string;

  /** Client user-agent string. */
  readonly useragent: string;

  /** Unix timestamp (seconds) when the token was issued. */
  readonly createdAt: number;
}

/**
 * JWT signing and verification utility using the jose library.
 *
 * Edge-compatible — works in Next.js middleware and API routes alike.
 *
 * @example
 * ```ts
 * const jwtUtil = new JwtUtil(new TextEncoder().encode("secret"));
 * const token = await jwtUtil.sign({ sub: "hash", userid: "123", useragent: "UA", createdAt: Date.now() });
 * const payload = await jwtUtil.verify(token);
 * ```
 */
export class JwtUtil {
  constructor(private readonly secret: Uint8Array) {}

  /**
   * Sign a JWT with HMAC-SHA256 and 1-hour expiry.
   *
   * @param payload - The claims to include in the token.
   * @returns The signed JWT string.
   *
   * @example
   * ```ts
   * const token = await jwtUtil.sign({
   *   sub: "abc123",
   *   userid: "user-1",
   *   useragent: "Mozilla/5.0",
   *   createdAt: Math.floor(Date.now() / 1000),
   * });
   * ```
   */
  async sign(payload: ChaiChatJWTPayload): Promise<string> {
    return new SignJWT(payload as unknown as JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(this.secret);
  }

  /**
   * Verify a JWT and return the decoded payload.
   *
   * @param token - The JWT string to verify.
   * @returns The verified payload.
   * @throws If the token is expired, invalid, or malformed.
   *
   * @example
   * ```ts
   * const payload = await jwtUtil.verify(token);
   * console.log(payload.userid); // "user-1"
   * ```
   */
  async verify(token: string): Promise<ChaiChatJWTPayload> {
    const { payload } = await jwtVerify(token, this.secret);
    return payload as unknown as ChaiChatJWTPayload;
  }
}

/**
 * Derive a session key from a JWT payload.
 *
 * Creates a deterministic hash that maps a JWT to its Redis session key.
 *
 * @param userid - The user identifier.
 * @param createdAt - The token issuance timestamp.
 * @returns A string key for session storage.
 *
 * @example
 * ```ts
 * const hash = deriveTokenHash("user-1", 1720000000);
 * // "user-1:1720000000"
 * ```
 */
export function deriveTokenHash(userid: string, createdAt: number): string {
  return `${userid}:${createdAt}`;
}
