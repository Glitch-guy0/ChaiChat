import { NextResponse } from "next/server";
import { JwtUtil } from "../../../infrastructure/jwt/jwt.util";
import { RedisSessionRepository } from "../../../infrastructure/redis/redis-session-repository";
import { PinoBetterStackLogger } from "../../../infrastructure/logging/pino-better-stack-logger";
import { ConversationUseCase } from "../../../application/use-cases/conversation-use-case";

/**
 * Lazy-initialized singletons for the conversation route.
 */

let sessionRepo: RedisSessionRepository | null = null;
let jwtUtil: JwtUtil | null = null;
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
 * GET /api/conversation — Fetch conversation history.
 *
 * Verifies the JWT cookie, extracts the token hash, and returns
 * the persisted conversation. Missing sessions return an empty array.
 *
 * @returns 200 OK with messages array, or 401 if unauthorized.
 *
 * @example
 * ```ts
 * // Request
 * GET /api/conversation
 * Cookie: auth=eyJhbG...
 *
 * // Response
 * 200 OK
 * [{ sender: "user", persona: "chai", content: "Hi" }, ...]
 * ```
 */
export async function GET(request: Request): Promise<NextResponse> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const authCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth="))
    ?.slice(5);

  if (!authCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tokenHash: string;
  try {
    const jwt = getJwtUtil();
    const payload = await jwt.verify(authCookie);
    tokenHash = payload.sub as string;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = new ConversationUseCase(getSessionRepo(), getLogger());
  const messages = await useCase.getConversation({ tokenHash });

  return NextResponse.json(messages);
}
