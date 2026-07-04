import { NextResponse } from "next/server";
import { JwtUtil } from "../../../infrastructure/jwt/jwt.util";
import { RedisSessionRepository } from "../../../infrastructure/redis/redis-session-repository";
import { OpenAILLMService } from "../../../infrastructure/llm/openai-llm-service";
import { FilePersonaCatalog } from "../../../infrastructure/persona/file-persona-catalog";
import { TiktokenCounter } from "../../../infrastructure/token-counter/tiktoken-counter";
import { PinoBetterStackLogger } from "../../../infrastructure/logging/pino-better-stack-logger";
import { ChatUseCase } from "../../../application/use-cases/chat-use-case";
import { ChatError, ChatErrorCode } from "../../../errors";
import { ChatMode } from "../../../types";
import { join } from "path";

/**
 * Lazy-initialized singletons for the chat route.
 */

let sessionRepo: RedisSessionRepository | null = null;
let llmService: OpenAILLMService | null = null;
let personaCatalog: FilePersonaCatalog | null = null;
let tokenCounter: TiktokenCounter | null = null;
let jwtUtil: JwtUtil | null = null;
let logger: PinoBetterStackLogger | null = null;

function getSessionRepo(): RedisSessionRepository {
  if (!sessionRepo) {
    sessionRepo = new RedisSessionRepository(process.env.REDIS_URL ?? "redis://localhost:6379");
  }
  return sessionRepo;
}

function getLlmService(): OpenAILLMService {
  if (!llmService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is required");
    llmService = new OpenAILLMService(apiKey, getTokenCounter(), {
      baseUrl: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL,
    });
  }
  return llmService;
}

function getTokenCounter(): TiktokenCounter {
  if (!tokenCounter) {
    tokenCounter = new TiktokenCounter();
  }
  return tokenCounter;
}

function getPersonaCatalog(): FilePersonaCatalog {
  if (!personaCatalog) {
    personaCatalog = new FilePersonaCatalog(join(process.cwd(), "persona"));
  }
  return personaCatalog;
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
 * POST /api/chat — Stream a chat completion.
 *
 * Verifies the JWT cookie, extracts the token hash, resolves
 * the persona and mode, streams tokens via SSE, and persists
 * the updated conversation.
 *
 * @returns SSE stream with token chunks on success.
 *
 * @example
 * ```ts
 * // Request
 * POST /api/chat
 * Body: { prompt: "Hello!", personaId: "chai", mode: "normal" }
 * Cookie: auth=eyJhbG...
 *
 * // Response
 * Content-Type: text/event-stream
 * data: {"token":"Hello"}
 * data: {"token":"!"}
 * data: [DONE]
 * ```
 */
export async function POST(request: Request): Promise<Response> {
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

  let body: { prompt?: string; personaId?: string; mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.prompt || !body.personaId || !body.mode) {
    return NextResponse.json(
      { error: "Missing required fields: prompt, personaId, mode" },
      { status: 400 },
    );
  }

  const { prompt, personaId, mode } = body;

  const useCase = new ChatUseCase(
    getSessionRepo(),
    getLlmService(),
    getPersonaCatalog(),
    getLogger(),
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chatMode = mode === "drunk" ? ChatMode.DRUNK : ChatMode.NORMAL;
        const chatInput = {
          tokenHash,
          prompt,
          personaId,
          mode: chatMode,
        };

        for await (const token of useCase.sendMessage(chatInput)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        if (error instanceof ChatError) {
          switch (error.code) {
            case ChatErrorCode.PERSONA_NOT_FOUND:
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: "Persona not found" })}\n\n`,
                ),
              );
              break;
            case ChatErrorCode.STREAM_INTERRUPTED:
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`,
                ),
              );
              break;
            default:
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: "Chat failed" })}\n\n`,
                ),
              );
          }
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`,
            ),
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
