import type { ILocationMetadata } from "../../types";

/**
 * Input for session initialization.
 *
 * Bundles the data captured during the auth flow:
 * user-agent, client IP, and generated user ID.
 *
 * @example
 * ```ts
 * const input: AuthSessionInput = {
 *   userId: "a1b2c3d4-...",
 *   userAgent: "Mozilla/5.0...",
 *   ip: "203.0.113.42",
 * };
 * ```
 */
export interface AuthSessionInput {
  /** UUID v4 identifier for the user session. */
  readonly userId: string;

  /** Client user-agent string. */
  readonly userAgent: string;

  /** Client IP address. */
  readonly ip: string;
}

/**
 * Result of a successful session initialization.
 *
 * Returned by {@link IAuthUseCase.initializeSession} after the session
 * is created and persisted.
 *
 * @example
 * ```ts
 * const result: AuthSessionResult = {
 *   tokenHash: "sha256-of-jwt",
 *   location: { country: "India", regionName: "Karnataka", city: "Bengaluru" },
 * };
 * ```
 */
export interface AuthSessionResult {
  /** The JWT-derived hash used as the session key in storage. */
  readonly tokenHash: string;

  /** Optional geolocation metadata resolved from the client IP. */
  readonly location: ILocationMetadata | null;
}

/**
 * Primary port for session initialization.
 *
 * The auth use-case orchestrates JWT signing, session persistence,
 * optional location resolution, and metrics logging — all behind
 * this single method.
 *
 * @example
 * ```ts
 * class AuthUseCase implements IAuthUseCase {
 *   constructor(
 *     private readonly sessionRepo: IChatSessionRepository,
 *     private readonly locationService: ILocationService,
 *     private readonly logger: IMetricsLogger,
 *   ) {}
 *
 *   async initializeSession(input: AuthSessionInput): Promise<AuthSessionResult> {
 *     // ...
 *   }
 * }
 * ```
 */
export interface IAuthUseCase {
  /**
   * Initialize a new session for a user.
   *
   * Creates a session in storage, optionally resolves location,
   * and returns the token hash for JWT signing.
   *
   * @param input - The session initialization input.
   * @returns The session result with token hash and optional location.
   *
   * @example
   * ```ts
   * const result = await authUseCase.initializeSession({
   *   userId: "a1b2c3d4-...",
   *   userAgent: "Mozilla/5.0...",
   *   ip: "203.0.113.42",
   * });
   * ```
   */
  initializeSession(input: AuthSessionInput): Promise<AuthSessionResult>;
}
