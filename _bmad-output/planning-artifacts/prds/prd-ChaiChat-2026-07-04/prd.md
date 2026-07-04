---
title: "ChaiChat — Hexagonal Architecture & Telemetry Update PRD"
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

ChaiChat is a high-fidelity, architecture-heavy showcase application. It demonstrates modern Next.js and TypeScript engineering patterns, including Hexagonal Architecture, dependency injection, session tracking, and telemetry observation.

---

## 3. Core Functional Requirements (FR)

### FR-1: Landing Page & Auth Initialization
- **Auth Endpoint:** When a user visits `/`, the frontend triggers a `POST` request to the backend user authentication token generator.
- **User Identification:**
  - Retrieve the incoming request's `user-agent`.
  - Frontend generates a unique `uuidv4` identifier and passes it via the `new-user` header.
- **JWT Generation:**
  - Generate a secure JWT token on the backend signed by a private key (generated from a unique string initialized at startup).
  - JWT Payload: `{ "user-agent": string, "userid": string, "createdAt": number }`.
  - Expiry: 1 hour.
- **Cookie Injection:** The generated JWT is stored as an HTTP-only cookie named `Authentication`. No frontend persistence is required.

### FR-2: Active Persona Switcher
- **Available Personas:** Configured as an enum: `"hitesh"` and `"piyush"`.
- **System Prompt Loading:** Loaded dynamically from a file at `{project-root}/persona/[persona-name].md`.
- **Header Selection:** Selectable headers at the top of the chat area. Switching active personas mid-chat does **not** reset the conversation history.

### FR-3: Ephemeral Chat & Switchable Modes
- **Chat Endpoint:** `POST /api/chat` with user prompt.
- **Modes:** "Normal" and "Drunk". Managed on hover on the left side of the input.
- **History Format:**
  - User messages: `{ user: "..." }`
  - Assistant messages: `{ assistant: "[persona]: ..." }` (e.g. `{ assistant: "hitesh: hello" }`).
- **Session Fetching:** `GET /api/conversation` fetches the conversation history if exists.

### FR-4: Session Persistence (Redis)
- **Storage:** Sessions and message histories are persisted in Redis using the JWT token or its hash as the key.
- **TTL:** The Redis session expires after 1 hour.

### FR-5: Telemetry, Metrics, and Error Reporting
- **Location Lookup:** During JWT generation, resolve the user's location by querying the `ip-api.com` API:
  - Endpoint: `http://ip-api.com/json/{userIp}?fields=status,message,country,regionName,city`
  - If successful, log metadata containing the user's country, regionName, and city.
- **Token Tracking:** Count tokens consumed for each prompt and response using `tiktoken`, and log usage against the JWT token ID.
- **Observability Stack:**
  - Logs: Output structured JSON via `pino`.
  - Errors: Better Stack Error tracking using Sentry SDK. DSN: `https://ozuB5c9buT43aC7xidTnZ6j3@s2572663.eu-nbg-2.betterstackdata.com/2572665`.

---

## 4. Architectural Specification (Hexagonal Design)

The system adheres to Hexagonal Architecture (Ports and Adapters) to separate core business logic from external drivers and systems (Redis, Sentry, IP-API, OpenAI).

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
        DomainModel["Domain Models: ChatSession, Message, Persona"]
        AuthUseCase["AuthUseCaseImpl"]
        ChatUseCase["ChatUseCaseImpl"]
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
 * Enum of all available personas in the application.
 */
export enum PersonaName {
  HITESH = "hitesh",
  PIYUSH = "piyush",
}

/**
 * Tone modes for the conversation style.
 */
export enum ChatMode {
  NORMAL = "NORMAL",
  DRUNK = "DRUNK",
}

/**
 * Data structure representing a chat message.
 */
export interface IMessage {
  readonly sender: "user" | "ai";
  readonly persona: PersonaName;
  readonly content: string;
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
  stream(
    systemPrompt: string,
    history: IMessage[],
    activePersona: PersonaName
  ): Promise<AsyncIterable<string>>;
}
```
