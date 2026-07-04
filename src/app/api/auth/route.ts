import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { AuthSessionInput } from "../../../application/ports";
import { AuthUseCase } from "../../../application/use-cases/auth-use-case";
import { RedisSessionRepository } from "../../../infrastructure/redis/redis-session-repository";
import { JwtUtil } from "../../../infrastructure/jwt/jwt.util";
import { IpApiLocationService } from "../../../infrastructure/location/ip-api-location-service";
import { PinoBetterStackLogger } from "../../../infrastructure/logging/pino-better-stack-logger";
import { AuthError, AuthErrorCode } from "../../../errors";

/**
 * Lazy-initialized singletons for the auth route.
 *
 * Created once on first request and reused across invocations.
 */

let sessionRepo: RedisSessionRepository | null = null;
let jwtUtil: JwtUtil | null = null;
let locationService: IpApiLocationService | null = null;
let logger: PinoBetterStackLogger | null = null;

function getSessionRepo(): RedisSessionRepository {
  if (!sessionRepo) {
    sessionRepo = new RedisSessionRepository(process.env.REDIS_URL ?? "redis://localhost:6379");
  }
  return sessionRepo;
}

function getJwtUtil(): JwtUtil {
  if (!jwtUtil) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is required");
    jwtUtil = new JwtUtil(new TextEncoder().encode(secret));
  }
  return jwtUtil;
}

function getLocationService(): IpApiLocationService {
  if (!locationService) {
    locationService = new IpApiLocationService();
  }
  return locationService;
}

function getLogger(): PinoBetterStackLogger {
  if (!logger) {
    logger = new PinoBetterStackLogger(
      process.env.NODE_ENV ?? "development",
      process.env.BETTER_STACK_TOKEN,
    );
  }
  return logger;
}

/**
 * POST /api/auth — Initialize a new session.
 *
 * Creates a UUID v4 user ID, resolves optional location, persists
 * an empty session in Redis, signs a JWT, and returns it as an
 * HTTP-only cookie.
 *
 * @returns 204 No Content with Set-Cookie header on success.
 *
 * @example
 * ```ts
 * // Request
 * POST /api/auth
 * Headers: { "new-user": "true", "user-agent": "Mozilla/5.0..." }
 *
 * // Response
 * 204 No Content
 * Set-Cookie: auth=eyJhbG...; HttpOnly; Path=/; Max-Age=3600
 * ```
 */
export async function POST(request: Request): Promise<NextResponse> {
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";

  const userId = uuidv4();

  const sessionRepo = getSessionRepo();
  const locService = getLocationService();
  const log = getLogger();

  const useCase = new AuthUseCase(sessionRepo, locService, log);

  try {
    const input: AuthSessionInput = { userId, userAgent, ip };
    const result = await useCase.initializeSession(input);

    const jwtUtil = getJwtUtil();
    const timestamp = Math.floor(Date.now() / 1000);
    const token = await jwtUtil.sign({
      sub: result.tokenHash,
      userid: userId,
      useragent: userAgent,
      createdAt: timestamp,
    });

    const response = new NextResponse(null, { status: 204 });
    response.headers.set(
      "Set-Cookie",
      `auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    );
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.code) {
        case AuthErrorCode.REDIS_CONNECTION_FAILED:
          return NextResponse.json(
            { error: "Service unavailable" },
            { status: 502 },
          );
        default:
          return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 },
          );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
