---
title: "ChaiChat — Backend Architecture Reference"
status: approved
created: 2026-07-04
updated: 2026-07-04
source: class.md, dependency.md, sequence.md
---

# ChaiChat — Backend Architecture Reference

> **Product Manager's Note (John):** This architecture was validated against the product brief during review. Every interface and use case maps to a real product requirement — session auth secures the single-user experience, persona switching maps to `IPersonaCatalog`, mode selection drives `IChatGenerationOptionsBuilder`. The hexagonal layering means we can swap Redis for SQLite, OpenAI for Anthropic, or Pino for Datadog without touching a single use case. That's the point of this exercise.
>
> **Technical Writer's Note (Paige):** The document that follows combines the class, dependency, and sequence views into a single reference. Each section starts with a diagram, then explains the intent. The Mermaid blocks are ready to render in any Mermaid-compatible viewer.

---

## Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Class Diagram — Structure](#2-class-diagram--structure)
3. [Dependency Diagram — Boundaries](#3-dependency-diagram--boundaries)
4. [Sequence Diagrams — Runtime Flow](#4-sequence-diagrams--runtime-flow)
5. [Boundary Rules](#5-boundary-rules)
6. [Runtime Adapter Replacement](#6-runtime-adapter-replacement)

---

## 1. Architecture Overview

ChaiChat's backend follows **hexagonal (ports and adapters) architecture** with three layers:

| Layer | Responsibility | Examples |
|---|---|---|
| **Primary Adapters** | Translate HTTP input into use-case input | `AuthRoute`, `ChatRoute`, `ConversationRoute` |
| **Application Core** | Owns application flow. Knows ports, not infrastructure. | `AuthUseCase`, `ChatUseCase`, `ConversationUseCase` |
| **Driven Ports** | Define contracts that keep infrastructure replaceable | `IChatSessionRepository`, `ILLMService`, `ILocationService`, `IMetricsLogger`, `IPersonaCatalog` |
| **Infrastructure Adapters** | Implement driven ports against real services | `RedisSessionRepository`, `OpenAILLMService`, `IpApiLocationService`, `PinoBetterStackLogger`, `FilePersonaCatalog` |

**Design principle:** Dependencies point inward. Primary and secondary adapters depend on ports and domain contracts. The core never depends on infrastructure implementations.

---

## 2. Class Diagram — Structure

```mermaid
classDiagram
    direction LR

    class AuthRoute {
        +POST(request) Response
    }

    class ChatRoute {
        +POST(request) StreamResponse
    }

    class ConversationRoute {
        +GET(request) Response
    }

    class IAuthUseCase {
        <<interface>>
        +initializeSession(input) AuthSessionResult
    }

    class IChatUseCase {
        <<interface>>
        +sendMessage(input) AsyncIterable~string~
    }

    class IConversationUseCase {
        <<interface>>
        +getConversation(input) MessageArray
    }

    class AuthUseCase {
        -locationService ILocationService
        -sessionRepository IChatSessionRepository
        -metricsLogger IMetricsLogger
        +initializeSession(input) AuthSessionResult
    }

    class ChatUseCase {
        -sessionRepository IChatSessionRepository
        -llmService ILLMService
        -personaCatalog IPersonaCatalog
        -generationOptionsBuilder IChatGenerationOptionsBuilder
        -metricsLogger IMetricsLogger
        +sendMessage(input) AsyncIterable~string~
    }

    class ConversationUseCase {
        -sessionRepository IChatSessionRepository
        -metricsLogger IMetricsLogger
        +getConversation(input) MessageArray
    }

    class ChatSession {
        +string id
        +MessageArray messages
        +number expiresAt
    }

    class IMessage {
        <<interface>>
        +string sender
        +string persona
        +string content
    }

    class IPersonaDefinition {
        <<interface>>
        +string id
        +string displayName
        +string systemPromptPath
    }

    class ChatMode {
        <<enumeration>>
        NORMAL
        DRUNK
    }

    class IChatGenerationOptions {
        <<interface>>
        +number temperature
    }

    class IChatGenerationOptionsBuilder {
        <<interface>>
        +withMode(mode) IChatGenerationOptionsBuilder
        +build() IChatGenerationOptions
    }

    class ChatGenerationOptionsBuilder {
        -ChatMode mode
        +withMode(mode) IChatGenerationOptionsBuilder
        +build() IChatGenerationOptions
    }

    class IChatCompletionRequest {
        <<interface>>
        +string systemPrompt
        +MessageArray history
        +string activePersona
        +IChatGenerationOptions options
    }

    class IChatSessionRepository {
        <<interface>>
        +getSession(tokenHash) PromiseMessageArray
        +saveSession(tokenHash, conversation) PromiseVoid
    }

    class ILLMService {
        <<interface>>
        +stream(request) PromiseTokenStream
    }

    class ILocationService {
        <<interface>>
        +resolveLocation(ip) PromiseLocationMetadata
    }

    class IMetricsLogger {
        <<interface>>
        +logEvent(event) PromiseVoid
        +logError(error) PromiseVoid
    }

    class IPersonaCatalog {
        <<interface>>
        +getPersona(personaId) PromisePersonaDefinition
        +getSystemPrompt(personaId) PromiseString
    }

    class RedisSessionRepository {
        -redis RedisClient
        +getSession(tokenHash) PromiseMessageArray
        +saveSession(tokenHash, conversation) PromiseVoid
    }

    class OpenAILLMService {
        -client OpenAI
        -tokenCounter ITokenCounter
        +stream(request) PromiseTokenStream
    }

    class IpApiLocationService {
        -httpClient IHttpClient
        +resolveLocation(ip) PromiseLocationMetadata
    }

    class PinoBetterStackLogger {
        -logger PinoLogger
        +logEvent(event) PromiseVoid
        +logError(error) PromiseVoid
    }

    class FilePersonaCatalog {
        -promptLoader IPromptLoader
        +getPersona(personaId) PromisePersonaDefinition
        +getSystemPrompt(personaId) PromiseString
    }

    AuthRoute --> IAuthUseCase
    ChatRoute --> IChatUseCase
    ConversationRoute --> IConversationUseCase

    IAuthUseCase <|.. AuthUseCase
    IChatUseCase <|.. ChatUseCase
    IConversationUseCase <|.. ConversationUseCase

    ChatUseCase --> IChatGenerationOptionsBuilder
    ChatUseCase --> IChatCompletionRequest
    ChatUseCase --> ChatMode
    ChatUseCase --> IPersonaCatalog

    ChatGenerationOptionsBuilder ..|> IChatGenerationOptionsBuilder
    ChatGenerationOptionsBuilder --> IChatGenerationOptions
    IChatCompletionRequest --> IChatGenerationOptions
    IChatCompletionRequest --> IMessage

    AuthUseCase --> ILocationService
    AuthUseCase --> IChatSessionRepository
    AuthUseCase --> IMetricsLogger

    ChatUseCase --> IChatSessionRepository
    ChatUseCase --> ILLMService
    ChatUseCase --> IMetricsLogger

    ConversationUseCase --> IChatSessionRepository
    ConversationUseCase --> IMetricsLogger

    ChatSession --> IMessage
    IPersonaCatalog --> IPersonaDefinition

    RedisSessionRepository ..|> IChatSessionRepository
    OpenAILLMService ..|> ILLMService
    IpApiLocationService ..|> ILocationService
    PinoBetterStackLogger ..|> IMetricsLogger
    FilePersonaCatalog ..|> IPersonaCatalog
```

### Class Responsibilities

| Class / Interface | Role |
|---|---|
| `AuthRoute`, `ChatRoute`, `ConversationRoute` | HTTP adapters — translate requests to use-case input, sign JWTs, manage cookies |
| `IAuthUseCase`, `IChatUseCase`, `IConversationUseCase` | Use-case interfaces — primary adapter boundary |
| `AuthUseCase`, `ChatUseCase`, `ConversationUseCase` | Application logic — orchestrate ports, never touch infrastructure |
| `ChatSession` | Domain aggregate — holds message history and TTL |
| `IMessage` | Domain contract — single message in a conversation |
| `IPersonaDefinition` | Domain contract — persona metadata |
| `ChatMode` | Domain enum — `NORMAL` or `DRUNK` |
| `IChatGenerationOptions` / `IChatGenerationOptionsBuilder` | Builder pattern — keeps LLM output controls extensible |
| `IChatCompletionRequest` | Domain contract — bundles system prompt, history, persona, and options |
| `IChatSessionRepository` | Driven port — session persistence |
| `ILLMService` | Driven port — LLM interaction |
| `ILocationService` | Driven port — IP geolocation |
| `IMetricsLogger` | Driven port — observability |
| `IPersonaCatalog` | Driven port — persona definitions and prompts |
| `RedisSessionRepository`, `OpenAILLMService`, etc. | Infrastructure adapters — implement driven ports |

---

## 3. Dependency Diagram — Boundaries

```mermaid
flowchart LR
    subgraph PrimaryAdapters["Primary Adapters"]
        AuthRoute["POST /api/auth"]
        ChatRoute["POST /api/chat"]
        ConversationRoute["GET /api/conversation"]
    end

    subgraph ApplicationCore["Application Core"]
        AuthUseCase["AuthUseCase"]
        ChatUseCase["ChatUseCase"]
        ConversationUseCase["ConversationUseCase"]
        OptionsBuilder["ChatGenerationOptionsBuilder"]
    end

    subgraph Domain["Domain Contracts"]
        Session["ChatSession"]
        Message["IMessage"]
        Persona["IPersonaDefinition"]
        Mode["ChatMode"]
        GenerationOptions["IChatGenerationOptions"]
        CompletionRequest["IChatCompletionRequest"]
    end

    subgraph Ports["Driven Ports"]
        SessionRepoPort["IChatSessionRepository"]
        LLMPort["ILLMService"]
        LocationPort["ILocationService"]
        MetricsPort["IMetricsLogger"]
        PersonaCatalogPort["IPersonaCatalog"]
    end

    subgraph Infrastructure["Infrastructure Adapters"]
        RedisRepo["RedisSessionRepository"]
        OpenAIAdapter["OpenAILLMService"]
        IpApiAdapter["IpApiLocationService"]
        LoggerAdapter["PinoBetterStackLogger"]
        PersonaCatalog["FilePersonaCatalog"]
    end

    AuthRoute --> AuthUseCase
    ChatRoute --> ChatUseCase
    ConversationRoute --> ConversationUseCase

    AuthUseCase --> Session
    AuthUseCase --> SessionRepoPort
    AuthUseCase --> LocationPort
    AuthUseCase --> MetricsPort

    ChatUseCase --> Message
    ChatUseCase --> Persona
    ChatUseCase --> Mode
    ChatUseCase --> OptionsBuilder
    ChatUseCase --> CompletionRequest
    ChatUseCase --> SessionRepoPort
    ChatUseCase --> LLMPort
    ChatUseCase --> MetricsPort
    ChatUseCase --> PersonaCatalogPort

    ConversationUseCase --> Message
    ConversationUseCase --> SessionRepoPort
    ConversationUseCase --> MetricsPort

    OptionsBuilder --> Mode
    OptionsBuilder --> GenerationOptions
    CompletionRequest --> Message
    CompletionRequest --> GenerationOptions

    RedisRepo --> SessionRepoPort
    OpenAIAdapter --> LLMPort
    IpApiAdapter --> LocationPort
    LoggerAdapter --> MetricsPort
    PersonaCatalog --> PersonaCatalogPort

    RedisRepo -. runtime .-> Redis[(Redis)]
    OpenAIAdapter -. runtime .-> OpenAI[(OpenAI API)]
    IpApiAdapter -. runtime .-> IpApi[(ip-api.com)]
    LoggerAdapter -. runtime .-> BetterStack[(Better Stack)]
    PersonaCatalog -. runtime .-> PromptFiles[(persona/*.md)]
```

### Boundary Rules

1. **Routes** depend on use-case interfaces, not infrastructure adapters.
2. **Use cases** depend on ports and domain contracts — never on Redis, OpenAI, Pino, Better Stack, or IP-API.
3. **Infrastructure adapters** implement ports.
4. **Domain contracts** remain stable and storage-agnostic.
5. **Frontend mode selection** maps to domain `ChatMode`; the backend maps `ChatMode` to generation options.
6. **Future LLM controls** extend `IChatGenerationOptions` and `IChatGenerationOptionsBuilder`, not route handlers or use-case flow.

---

## 4. Sequence Diagrams — Runtime Flow

### 4.1 Session Auth Initialization

Runs when the frontend initializes and requests a lightweight session.

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Frontend

    box transparent Primary Adapter
        participant AuthRoute as POST /api/auth
    end

    box transparent Application Core
        participant AuthUseCase as IAuthUseCase
        participant SessionPolicy as Session Policy
    end

    box transparent Driven Ports
        participant LocationPort as ILocationService
        participant SessionRepo as IChatSessionRepository
        participant MetricsLogger as IMetricsLogger
    end

    box transparent Infrastructure Adapters
        participant IpApi as IpApiLocationService
        participant Redis as Redis
        participant Logger as PinoBetterStackLogger
    end

    Browser->>AuthRoute: POST /api/auth with new-user header
    AuthRoute->>AuthRoute: Read user-agent and client IP
    AuthRoute->>AuthUseCase: initializeSession(userId, userAgent, ip)
    AuthUseCase->>SessionPolicy: Build session metadata and expiry
    SessionPolicy-->>AuthUseCase: Session identity and expiresAt

    opt Location lookup is enabled
        AuthUseCase->>LocationPort: resolveLocation(ip)
        LocationPort->>IpApi: GET ip-api.com/json/{ip}
        alt Location lookup succeeds
            IpApi-->>LocationPort: country, regionName, city
            LocationPort-->>AuthUseCase: Location metadata
        else Location lookup fails
            IpApi-->>LocationPort: Error or unavailable response
            LocationPort-->>AuthUseCase: null
        end
    end

    AuthUseCase->>SessionRepo: saveSession(tokenHash, emptyConversation)
    SessionRepo->>Redis: SET session key with 1 hour TTL
    Redis-->>SessionRepo: OK
    SessionRepo-->>AuthUseCase: Session persisted

    AuthUseCase->>MetricsLogger: log session_created event
    MetricsLogger->>Logger: Emit structured JSON log
    Logger-->>MetricsLogger: Logged

    AuthUseCase-->>AuthRoute: Auth session result
    AuthRoute->>AuthRoute: Sign JWT and create Authentication cookie
    AuthRoute-->>Browser: 204 No Content with HTTP-only cookie
```

**Key flows:**
- Location resolution is optional — failure degrades gracefully to `null`
- Session is persisted with 1-hour TTL
- Response is `204 No Content` with HTTP-only cookie (no body)

---

### 4.2 Conversation History Fetch

Restores retained conversation history on page refresh or chat screen load.

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Frontend

    box transparent Primary Adapter
        participant ConvRoute as GET /api/conversation
    end

    box transparent Application Core
        participant ConversationUseCase as IConversationUseCase
    end

    box transparent Driven Ports
        participant SessionRepo as IChatSessionRepository
        participant MetricsLogger as IMetricsLogger
    end

    box transparent Infrastructure Adapters
        participant Redis as Redis
        participant Logger as PinoBetterStackLogger
    end

    Browser->>ConvRoute: GET /api/conversation with Authentication cookie
    ConvRoute->>ConvRoute: Verify JWT and derive token hash

    alt Cookie is missing or JWT is expired
        ConvRoute-->>Browser: 401 Unauthorized
    else Session is valid
        ConvRoute->>ConversationUseCase: getConversation(tokenHash)
        ConversationUseCase->>SessionRepo: getSession(tokenHash)
        SessionRepo->>Redis: GET session key

        alt Redis session exists
            Redis-->>SessionRepo: Serialized conversation
            SessionRepo-->>ConversationUseCase: Conversation messages
            ConversationUseCase->>MetricsLogger: log conversation_loaded event
            MetricsLogger->>Logger: Emit structured JSON log
            Logger-->>MetricsLogger: Logged
            ConversationUseCase-->>ConvRoute: Conversation history
            ConvRoute-->>Browser: 200 OK with messages
        else Redis session expired or missing
            Redis-->>SessionRepo: null
            SessionRepo-->>ConversationUseCase: Empty conversation
            ConversationUseCase-->>ConvRoute: Empty conversation
            ConvRoute-->>Browser: 200 OK with empty messages
        end
    end
```

**Key flows:**
- JWT verification gates access — expired or missing cookies return `401`
- Missing/expired Redis sessions return empty conversation (not an error)
- Metrics logged for every successful load

---

### 4.3 Chat Completion Streaming

The core flow: send a prompt, apply persona and mode, stream the LLM response, persist the conversation.

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Frontend

    box transparent Primary Adapter
        participant ChatRoute as POST /api/chat
    end

    box transparent Application Core
        participant ChatUseCase as IChatUseCase
        participant PersonaCatalog as IPersonaCatalog
        participant OptionsBuilder as IChatGenerationOptionsBuilder
    end

    box transparent Driven Ports
        participant SessionRepo as IChatSessionRepository
        participant LLMPort as ILLMService
        participant MetricsLogger as IMetricsLogger
    end

    box transparent Infrastructure Adapters
        participant Redis as Redis
        participant PromptLoader as FilePersonaPromptLoader
        participant OpenAI as OpenAILLMService
        participant TokenCounter as TiktokenCounter
        participant Logger as PinoBetterStackLogger
    end

    Browser->>ChatRoute: POST /api/chat with prompt, personaId, mode
    ChatRoute->>ChatRoute: Verify JWT and derive token hash

    alt Cookie is missing or JWT is expired
        ChatRoute-->>Browser: 401 Unauthorized
    else Request is authenticated
        ChatRoute->>ChatUseCase: sendMessage(tokenHash, prompt, personaId, mode)
        ChatUseCase->>SessionRepo: getSession(tokenHash)
        SessionRepo->>Redis: GET session key

        alt Existing conversation found
            Redis-->>SessionRepo: Serialized messages
            SessionRepo-->>ChatUseCase: Prior conversation
        else No conversation found
            Redis-->>SessionRepo: null
            SessionRepo-->>ChatUseCase: Empty conversation
        end

        ChatUseCase->>ChatUseCase: Append user message to domain conversation
        ChatUseCase->>PersonaCatalog: getPersona(personaId)
        PersonaCatalog->>PromptLoader: Load persona prompt file
        PromptLoader-->>PersonaCatalog: System prompt
        PersonaCatalog-->>ChatUseCase: Persona definition and system prompt

        ChatUseCase->>OptionsBuilder: withMode(mode)
        alt mode is NORMAL
            OptionsBuilder-->>OptionsBuilder: temperature = 0
        else mode is DRUNK
            OptionsBuilder-->>OptionsBuilder: temperature = 0.5
        end
        ChatUseCase->>OptionsBuilder: build()
        OptionsBuilder-->>ChatUseCase: Immutable generation options

        ChatUseCase->>LLMPort: stream(ChatCompletionRequest)
        LLMPort->>TokenCounter: Count prompt tokens
        TokenCounter-->>LLMPort: Prompt token count
        LLMPort->>OpenAI: Stream completion with system prompt, history, temperature

        loop For each streamed token
            OpenAI-->>LLMPort: Token chunk
            LLMPort-->>ChatUseCase: Token chunk
            ChatUseCase-->>ChatRoute: Token chunk
            ChatRoute-->>Browser: Stream token chunk
        end

        OpenAI-->>LLMPort: Stream completed
        LLMPort->>TokenCounter: Count response tokens
        TokenCounter-->>LLMPort: Response token count
        LLMPort-->>ChatUseCase: Final assistant message and token usage

        ChatUseCase->>ChatUseCase: Append assistant message with personaId
        ChatUseCase->>SessionRepo: saveSession(tokenHash, updatedConversation)
        SessionRepo->>Redis: SET session key with refreshed 1 hour TTL
        Redis-->>SessionRepo: OK

        ChatUseCase->>MetricsLogger: log chat_completed with token usage
        MetricsLogger->>Logger: Emit structured JSON log
        Logger-->>MetricsLogger: Logged

        ChatUseCase-->>ChatRoute: Stream completed
        ChatRoute-->>Browser: Close stream
    end
```

**Key flows:**
- JWT validation gates all requests
- Prior conversation is loaded (or empty if session missing)
- Persona and mode are resolved before the LLM call
- Each token is streamed through the use case → route → browser
- After completion, the full conversation (user + assistant messages) is persisted with refreshed TTL
- Token usage is logged to metrics

---

### 4.4 Chat Error Handling

Failures stay inside adapter boundaries; the core receives explicit typed errors.

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Frontend

    participant ChatRoute as POST /api/chat
    participant ChatUseCase as IChatUseCase
    participant LLMPort as ILLMService
    participant OpenAI as OpenAILLMService
    participant MetricsLogger as IMetricsLogger
    participant Logger as PinoBetterStackLogger

    Browser->>ChatRoute: POST /api/chat
    ChatRoute->>ChatUseCase: sendMessage(...)
    ChatUseCase->>LLMPort: stream(ChatCompletionRequest)
    LLMPort->>OpenAI: Stream completion

    alt LLM provider fails before response starts
        OpenAI-->>LLMPort: Provider error
        LLMPort-->>ChatUseCase: LLMServiceError
        ChatUseCase->>MetricsLogger: log chat_failed
        MetricsLogger->>Logger: Emit structured error log
        ChatUseCase-->>ChatRoute: Failure result
        ChatRoute-->>Browser: 502 Bad Gateway
    else LLM provider fails after partial stream
        OpenAI-->>LLMPort: Streaming error
        LLMPort-->>ChatUseCase: Stream failure
        ChatUseCase->>MetricsLogger: log chat_stream_failed
        MetricsLogger->>Logger: Emit structured error log
        ChatUseCase-->>ChatRoute: Terminate stream
        ChatRoute-->>Browser: Close stream with error metadata
    end
```

**Error handling strategy:**

| Error Scenario | HTTP Response | Logged As |
|---|---|---|
| Missing / expired JWT | `401 Unauthorized` | Route-level (before use case) |
| LLM provider fails before response | `502 Bad Gateway` | `chat_failed` |
| LLM provider fails mid-stream | Stream closed with metadata | `chat_stream_failed` |
| Redis unavailable (session load) | Degrades to empty conversation | `session_load_failed` (logged, not thrown) |
| Redis unavailable (session save) | Stream succeeds, save logged | `session_save_failed` |

---

## 5. Boundary Rules (Summary)

1. **Routes** depend on use-case interfaces only.
2. **Use cases** depend on ports and domain contracts — never on concrete infrastructure.
3. **Infrastructure adapters** implement driven ports. Swapping Redis for SQLite, OpenAI for Anthropic, or Pino for Datadog changes nothing in the core.
4. **Domain contracts** are stable and storage-agnostic. `ChatSession`, `IMessage`, `ChatMode`, etc. have no infrastructure imports.
5. **Frontend mode selection** maps to domain `ChatMode`; the backend translates `ChatMode` to `IChatGenerationOptions` via the builder.
6. **New LLM controls** extend `IChatGenerationOptions` and `IChatGenerationOptionsBuilder` — no route or use-case changes needed.

---

## 6. Runtime Adapter Replacement

Every driven port can be replaced at runtime by injecting a different implementation:

```mermaid
flowchart TD
    ChatUseCase["ChatUseCase"]
    LLMPort["ILLMService"]

    ChatUseCase --> LLMPort

    LLMPort --> OpenAI["OpenAILLMService"]
    LLMPort --> MockLLM["MockLLMService"]
    LLMPort --> FutureProvider["FutureProviderLLMService"]

    SessionUseCases["AuthUseCase and ConversationUseCase"]
    SessionRepoPort["IChatSessionRepository"]

    SessionUseCases --> SessionRepoPort
    ChatUseCase --> SessionRepoPort

    SessionRepoPort --> RedisRepo["RedisSessionRepository"]
    SessionRepoPort --> MemoryRepo["InMemorySessionRepository"]
    SessionRepoPort --> FutureRepo["FutureSessionRepository"]
```

**Current infrastructure choices:**

| Port | Implementation | Production Ready |
|---|---|---|
| `IChatSessionRepository` | `RedisSessionRepository` | Yes |
| `ILLMService` | `OpenAILLMService` | Yes |
| `ILocationService` | `IpApiLocationService` | Yes |
| `IMetricsLogger` | `PinoBetterStackLogger` | Yes |
| `IPersonaCatalog` | `FilePersonaCatalog` | Yes |

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Hexagonal architecture** | Clean separation lets us swap infrastructure without touching use cases. Proves SOLID compliance. |
| **Streaming via `AsyncIterable`** | Use case returns a token stream; route adapter chooses how to deliver it (SSE, WebSocket, etc.). |
| **Builder pattern for generation options** | Adding `maxTokens`, `topP`, or future parameters extends the builder, not the use case signature. |
| **JWT for session tokens** | Stateless, HTTP-only cookie fits the single-user-scope. No session DB needed. |
| **1-hour TTL** | Matches realistic chat session duration. Refreshed on each interaction. |
| **Location as optional** | Degrades gracefully. Feature flag in the use case, not a hard dependency. |

---

*Generated from `class.md`, `dependency.md`, and `sequence.md` — reviewed and approved.*
