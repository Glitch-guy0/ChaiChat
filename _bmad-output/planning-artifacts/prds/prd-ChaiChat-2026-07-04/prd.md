---
title: "ChaiChat — Hexagonal Architecture PoC PRD"
status: draft
created: 2026-07-04
updated: 2026-07-04
author: John (Product Manager)
---

# ChaiChat — Product Requirements Document (PRD)

## 1. Document Control & Overview

- **Title:** ChaiChat — Dual-Persona AI Chat Application
- **Status:** Draft (Hexagonal Update)
- **Author:** John (Product Manager)
- **Date:** 2026-07-04
- **Target Version:** 1.1.0

---

## 2. Product Vision & Goals

ChaiChat is a proof-of-concept application that demonstrates a hexagonal Next.js and TypeScript architecture with minimal core churn when external dependencies change. The product is intentionally narrow: simple session retention, switchable personas, and switchable response modes.

The PRD is the source of truth for scope. This version prioritizes architectural clarity over production-hardening.

---

## 3. Core Functional Requirements (FR)

### FR-1: Landing Page & Session Auth Initialization
- **Auth Endpoint:** When a user visits `/`, the frontend triggers a `POST` request to the backend session-auth endpoint.
- **User Identification:**
  - Retrieve the incoming request's `user-agent`.
  - Frontend generates a unique `uuidv4` identifier and passes it via the `new-user` header.
- **JWT Generation:**
  - Generate a JWT token on the backend using a server-side secret configured at startup.
  - JWT Payload: `{ "user-agent": string, "userid": string, "createdAt": number }`.
  - Expiry: 1 hour.
- **Cookie Injection:** The generated JWT is stored as an HTTP-only cookie named `Authentication`.
- **Purpose:** This auth flow exists only to support session retention for the proof of concept.

### FR-2: Active Persona Switcher
- **Available Personas:** Configured from persona files and manifest data, not hardcoded into chat logic.
- **System Prompt Loading:** Loaded dynamically from a file at `{project-root}/persona/[persona-name].md`.
- **Header Selection:** Selectable headers at the top of the chat area. Switching active personas mid-chat does **not** reset the conversation history.

### FR-3: Session-Persisted Chat & Switchable Modes
- **Chat Endpoint:** `POST /api/chat` with user prompt.
- **Modes:** "Normal" and "Drunk". Managed on hover on the left side of the input.
- **Mode-to-LLM Mapping:**
  - `Normal` maps to LLM temperature `0`.
  - `Drunk` maps to LLM temperature `0.5`.
- **Generation Options:** Conversation-related LLM controls must be created through a builder-style contract so future controls such as temperature, max tokens, top-p, response format, or safety flags can be added without changing the chat use-case flow.
- **History Format:**
  - User messages: `{ user: "..." }`
  - Assistant messages: `{ assistant: "[persona-id]: ..." }` (e.g. `{ assistant: "chai: hello" }`).
- **Session Fetching:** `GET /api/conversation` fetches the conversation history if exists.
- **Persistence Rule:** Conversation history is retained for the life of the auth session and restored on refresh.

### FR-4: Session Persistence (Redis)
- **Storage:** Sessions and message histories are persisted in Redis using the JWT token or its hash as the key.
- **TTL:** The Redis session expires after 1 hour and is aligned with the JWT expiry.

### FR-5: Logging and Error Reporting
- **Location Lookup:** During JWT generation, resolve the user's location by querying the `ip-api.com` API:
  - Endpoint: `http://ip-api.com/json/{userIp}?fields=status,message,country,regionName,city`
  - If successful, log metadata containing the user's country, regionName, and city.
- **Token Tracking:** Count tokens consumed for each prompt and response using `tiktoken`, and log usage against the JWT token ID.
- **Observability Stack:**
  - Logs: Output structured JSON via `pino`.
  - Errors: Better Stack Error tracking using Sentry SDK. DSN is supplied via environment configuration, not hardcoded in the application.

### FR-6: Non-Goals for the PoC
- OpenTelemetry tracing is out of scope for this version.
- Production-grade security hardening is out of scope for this version.
- Multi-user collaboration is out of scope for this version.

---

## 4. Architectural Specification (Hexagonal Design)

The system adheres to Hexagonal Architecture (Ports and Adapters) to separate core business logic from external drivers and systems (Redis, Sentry, IP-API, OpenAI). The approved architecture keeps conversation rules in the core and treats external infrastructure as replaceable adapters.

```mermaid
graph TD
    subgraph Primary Adapters (UI / Web)
        NextPage["Next.js Pages (/, /chat)"]
        AuthRoute["POST /api/auth"]
        ChatRoute["POST /api/chat"]
        ConvRoute["GET /api/conversation"]
    end

    subgraph Driving Ports
        IAuthPort["IAuthUseCase"]
        IChatPort["IChatUseCase"]
    end

    subgraph Core Domain (Hexagon)
        DomainModel["Domain Models: ChatSession, Message, Persona, GenerationOptions"]
        AuthUseCase["AuthUseCaseImpl"]
        ChatUseCase["ChatUseCaseImpl"]
        OptionsBuilder["ChatGenerationOptionsBuilder"]
    end

    subgraph Driven Ports
        IRepositoryPort["IChatSessionRepository"]
        ILLMPort["ILLMService"]
        ILocationPort["ILocationService"]
        ILoggerPort["IMetricsLogger"]
    end

    subgraph Secondary Adapters (Infrastructure)
        RedisRepo["RedisSessionRepository (Redis DB)"]
        OpenAIGateway["OpenAILLMService (OpenAI SDK + Tiktoken)"]
        IpApiLocation["IpApiLocationService (ip-api.com)"]
        SentryLogger["PinoBetterStackLogger (BetterStack + Sentry DSN)"]
    end

    %% Connections
    NextPage --> AuthRoute
    NextPage --> ChatRoute
    NextPage --> ConvRoute

    AuthRoute --> IAuthPort
    ChatRoute --> IChatPort
    ConvRoute --> IChatPort

    IAuthPort --> AuthUseCase
    IChatPort --> ChatUseCase

    AuthUseCase --> DomainModel
    ChatUseCase --> DomainModel
    ChatUseCase --> OptionsBuilder

    AuthUseCase --> ILocationPort
    AuthUseCase --> ILoggerPort
    AuthUseCase --> IRepositoryPort

    ChatUseCase --> IRepositoryPort
    ChatUseCase --> ILLMPort
    ChatUseCase --> ILoggerPort

    IRepositoryPort --> RedisRepo
    ILLMPort --> OpenAIGateway
    ILocationPort --> IpApiLocation
    ILoggerPort --> SentryLogger
```

### 4.1 TypeScript Ports & Domain Contracts

```typescript
/**
 * Contract for a persona loaded from configuration.
 */
export interface IPersonaDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly systemPromptPath: string;
}

/**
 * Tone modes for the conversation style.
 */
export enum ChatMode {
  NORMAL = "NORMAL",
  DRUNK = "DRUNK",
}

/**
 * LLM generation settings derived from conversation controls.
 */
export interface IChatGenerationOptions {
  readonly temperature: number;
}

/**
 * Builder contract for constructing LLM generation settings from chat controls.
 */
export interface IChatGenerationOptionsBuilder {
  /**
   * Applies the selected chat mode to the generation options.
   */
  withMode(mode: ChatMode): IChatGenerationOptionsBuilder;

  /**
   * Builds immutable generation options for the LLM port.
   */
  build(): IChatGenerationOptions;
}

/**
 * Data structure representing a chat message.
 */
export interface IMessage {
  readonly sender: "user" | "ai";
  readonly persona: string;
  readonly content: string;
}

/**
 * Request object passed from the chat use case to the LLM port.
 */
export interface IChatCompletionRequest {
  readonly systemPrompt: string;
  readonly history: ReadonlyArray<IMessage>;
  readonly activePersona: string;
  readonly options: IChatGenerationOptions;
}

/**
 * Geolocation metadata resolved from user IP.
 */
export interface ILocationMetadata {
  readonly city: string;
  readonly regionName: string;
  readonly country: string;
}

/**
 * JWT payload structures for authenticated users.
 */
export interface IAuthTokenPayload {
  readonly userAgent: string;
  readonly userId: string;
  readonly createdAt: number;
}

/**
 * Port representing the repository for storage of chat sessions.
 */
export interface IChatSessionRepository {
  /**
   * Fetches the conversation history for a given token hash.
   */
  getSession(tokenHash: string): Promise<IMessage[]>;

  /**
   * Saves or updates the conversation history with an expiration TTL of 1 hour.
   */
  saveSession(tokenHash: string, conversation: IMessage[]): Promise<void>;
}

/**
 * Port for resolving user location via external IP services.
 */
export interface ILocationService {
  /**
   * Resolves location coordinates/metadata from an IP address.
   */
  resolveLocation(ip: string): Promise<ILocationMetadata | null>;
}

/**
 * Port for managing interactions with the LLM gateway.
 */
export interface ILLMService {
  /**
   * Generates a streaming response for the selected persona.
   */
  stream(request: IChatCompletionRequest): Promise<AsyncIterable<string>>;
}
```

### 4.2 Conversation Generation Rules

The frontend only sends the selected conversation mode. It does not send raw LLM parameters.

The chat use case maps the selected `ChatMode` into immutable generation options through `IChatGenerationOptionsBuilder`.

Initial mapping:

| Mode | Temperature | Purpose |
|---|---:|---|
| `NORMAL` | `0` | Deterministic, controlled persona response |
| `DRUNK` | `0.5` | Looser, more varied persona response |

Future LLM controls must be added to `IChatGenerationOptions` and the builder implementation. The `IChatUseCase` flow should remain stable unless the user-facing conversation behavior itself changes.

### 4.3 Backend Runtime Contract

The backend runtime follows a fixed set of flows so the hexagonal boundaries remain stable:

- `POST /api/auth` initializes a lightweight session, resolves optional location metadata, stores an empty session in Redis, and returns the JWT cookie.
- `GET /api/conversation` validates the auth cookie, derives the session key, and restores the retained conversation history from Redis.
- `POST /api/chat` validates the auth cookie, loads the session history, resolves the selected persona prompt, maps the selected mode into generation options, streams the LLM response, appends the assistant message, and persists the updated session.
- Errors remain adapter-scoped. The core emits explicit failure states instead of handling infrastructure details directly.
- Routes depend on use cases. Use cases depend on ports. Infrastructure adapters implement ports.

### 4.4 Boundary Summary

- Primary adapters: HTTP routes for auth, chat, and conversation.
- Application core: auth, conversation, and chat use cases plus the generation-options builder.
- Domain contracts: session, message, persona, mode, generation options, and chat completion request.
- Driven ports: session repository, LLM service, location service, metrics logger, and persona catalog.
- Infrastructure adapters: Redis, OpenAI, IP-API, file-backed persona prompts, and structured logging.
