---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - architecture-review-winston
  - implementation-complete
inputDocuments:
  - prds/prd-ChaiChat-2026-07-04/prd.md
  - backend-architecture.md
implementationStatus:
  date: 2026-07-05
  allMilestonesComplete: true
  documentationUpdated: true
architectureReview:
  reviewer: Winston
  date: 2026-07-04
  changes:
    - M1: added tsc --noEmit verification
    - M2: Redis consolidated from M7 into M2
    - M2/M4/M7: per-use-case error types added
    - M8: JSDoc lint enforcement instead of cleanup pass
    - M2/M3: noted as parallelizable
    - .env.example created with all required vars
---

# ChaiChat - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ChaiChat, decomposing the requirements from the PRD and Architecture requirements into implementable stories. UX design is deferred to a later phase.

## Requirements Inventory

### Functional Requirements

FR1: Landing Page triggers POST /api/auth with uuidv4 userId (new-user header) and user-agent on visit
FR2: Backend generates JWT (payload: user-agent, userid, createdAt) with 1-hour expiry, stores as HTTP-only cookie
FR3: Location metadata optionally resolved via ip-api.com during auth, logged if available
FR4: Personas loaded dynamically from persona/*.md config files (not hardcoded)
FR5: Persona switcher at top of chat area — switching personas mid-chat does not reset history
FR6: POST /api/chat streams LLM response token-by-token with prompt, personaId, and mode
FR7: Two chat modes: "Normal" (temperature 0) and "Drunk" (temperature 0.5)
FR8: Conversation history persisted in Redis with JWT hash as key, 1-hour TTL
FR9: GET /api/conversation restores conversation history on page refresh
FR10: Token counting via tiktoken for each prompt and response, logged per session
FR11: Structured JSON logging via pino for all events and errors
FR12: Error tracking via Better Stack / Sentry DSN

### NonFunctional Requirements

NFR1: Hexagonal architecture — clean separation with ports and adapters
NFR2: SOLID compliance — every service follows single responsibility, open/closed, LSP, ISP, DIP
NFR3: Interface-driven design — all services have interfaces, no direct coupling to implementations
NFR4: Strong typing — named types and interfaces for every API boundary
NFR5: Dependency injection — services receive dependencies via constructor, no internal instantiation
NFR6: Streaming responses via AsyncIterable — route adapter chooses delivery mechanism (SSE)
NFR7: Location resolution is optional — graceful degradation to null on failure
NFR8: 1-hour session TTL aligned between JWT and Redis
NFR9: Immutability — prefer readonly, ReadonlyArray, pure functions
NFR10: Error handling — explicit error types, no swallowed errors, documented throws

### Additional Requirements

- Next.js App Router with TypeScript
- Tailwind CSS v4 for styling (already configured)
- OpenAI SDK for LLM integration
- tiktoken for token counting
- Redis for session storage
- Pino for structured logging
- dotenv for environment configuration
- Persona config files at {project-root}/persona/[persona-name].md
- Static persona images at assets/images/persona1.png and assets/images/persona2.png
- Geist Sans + Geist Mono fonts via next/font (already configured)
- Premium dark-theme CSS already exists in globals.css
- JSDoc documentation for every exported symbol (per AGENTS.md)
- Every FR must have testable acceptance criteria
- Chat page route (/chat) does not exist yet — must be created
- No API routes exist — all three (auth, chat, conversation) must be built from scratch

### UX Design Requirements

*Deferred to later phase — UX design will be planned once backend and product are stable.*

## Milestones & Epics

### Milestone 1: Foundation — Domain & Port Contracts

**Verify by:** `tsc --noEmit` passes with zero errors. All interfaces, types, and enums defined and compiling.

| Epic | Stories | FRs |
|---|---|---|
| M1-S1 | Define domain types and interfaces | NFR1-NFR5 |

**Scope:**
- Create src/types/ with all domain contracts: IMessage, ChatMode, IChatGenerationOptions, IChatGenerationOptionsBuilder, IPersonaDefinition, IChatCompletionRequest, IAuthTokenPayload, ILocationMetadata
- Create src/ports/ with all driven port interfaces: IChatSessionRepository, ILLMService, ILocationService, IMetricsLogger, IPersonaCatalog
- Create src/domain/ with domain models: ChatSession
- Create src/application/ports/ with use-case interfaces: IAuthUseCase, IChatUseCase, IConversationUseCase
- JSDoc on every exported symbol as it's written
- Add TypeScript strict mode checks to tsconfig
- Smoke test: `tsc --noEmit` in CI / pre-commit

---

### Milestone 2: Session Auth & Redis

**Verify by:** POST /api/auth returns 204 with Set-Cookie header. Session persisted in Redis. JWT decodes correctly.

| Epic | Stories | FRs |
|---|---|---|
| M2-S1 | Implement Landing page auth trigger | FR1 |
| M2-S2 | Build AuthUseCase with JWT signing | FR2 |
| M2-S3 | Set up Redis connection and session repository | FR8 |
| M2-S4 | Create Auth API route | FR1, FR2 |
| M2-S5 | Add AuthError types and error handling | NFR10 |

**Scope:**
- Landing page (page.tsx) fires POST /api/auth on mount with uuidv4 userId
- JWT signing utility with 1-hour expiry
- AuthUseCase implementing IAuthUseCase
- POST /api/auth route adapter
- HTTP-only cookie injection
- Redis client setup with .env configuration
- RedisSessionRepository with saveSession (empty session on auth)
- 1-hour TTL aligned with JWT expiry
- AuthError class with typed error cases (JwtSignError, RedisConnectionError, etc.)
- .env.example created with all required vars

**Testing:** curl / Postman — POST /api/auth → 204 + Set-Cookie. Verify JWT at jwt.io. Verify Redis key exists with TTL.

---

### Milestone 3: Persona System

**Verify by:** Persona configs load from files. Catalog returns definitions and system prompts.

| Epic | Stories | FRs |
|---|---|---|
| M3-S1 | Create IPersonaCatalog and FilePersonaCatalog | FR4 |
| M3-S2 | Create persona config files (persona/chai.md, persona/espresso.md) | FR4 |
| M3-S3 | Create IChatGenerationOptionsBuilder and ChatGenerationOptionsBuilder | FR7 |

**Scope:**
- File-based persona catalog reads from persona/*.md
- Persona definition files with name, display name, system prompt path
- ChatGenerationOptionsBuilder with withMode() / build()
- Static image assets at assets/images/persona1.png and persona2.png
- IChatGenerationOptions with temperature

---

### Milestone 4: Chat Backend

**Verify by:** POST /api/chat streams token chunks. Persona and mode affect response. Tokens counted. Errors return typed responses.

| Epic | Stories | FRs |
|---|---|---|
| M4-S1 | Implement ILLMService with OpenAI streaming | FR6 |
| M4-S2 | Build ChatUseCase with persona/mode resolution | FR6, FR7 |
| M4-S3 | Integrate tiktoken token counting | FR10 |
| M4-S4 | Create Chat API route with SSE streaming | FR6 |
| M4-S5 | Add ChatError types and streaming error handling | NFR10 |

**Scope:**
- OpenAILLMService implementing ILLMService with streaming
- tiktoken integration for prompt/response token counting
- ChatUseCase: load session, resolve persona, build options, stream, append, save
- POST /api/chat with SSE response
- ChatError types: LLMProviderError, StreamInterruptedError, SessionLoadError, TokenCountError
- Error responses: 401 (no auth), 502 (provider down), stream closed with error metadata
- Logger integration via IMetricsLogger

**Testing:** curl — POST /api/chat with auth cookie → streaming token output. Provoke 502 by using bad API key. Verify tiktoken counts in logs.

---

### Milestone 5: Chat Page — Core UI

**Verify by:** User can type a message, see it appear as a right-aligned bubble, watch streaming response appear in real-time.

| Epic | Stories | FRs |
|---|---|---|
| M5-S1 | Create /chat route and page layout | - |
| M5-S2 | Build chat bubble components (user + AI) | - |
| M5-S3 | Build message input bar with send button | - |
| M5-S4 | Implement SSE consumption and streaming display | FR6 |

**Scope:**
- /chat page with three-zone layout (top bar, chat area, input)
- UserMessageBubble component (right-aligned, tail)
- AIMessageBubble component (left-aligned, tail, persona label)
- MessageInput component with text field + send button
- EventSource / fetch SSE stream and render tokens incrementally
- Smooth scroll-to-bottom on new messages
- ChatSession React context for state management
- Micro-interaction animations on mount and new messages

---

### Milestone 6: Persona Switcher & Mode Selector

**Verify by:** Switching persona mid-chat doesn't clear history. Mode toggle changes subsequent response style.

| Epic | Stories | FRs |
|---|---|---|
| M6-S1 | Build persona switcher tabs in top bar | FR5 |
| M6-S2 | Build mode selector (Normal / Drunk pills) | FR7 |
| M6-S3 | Wire persona/mode into chat API calls | FR5, FR6, FR7 |

**Scope:**
- PersonaSwitcher component: two tabs/buttons with avatar + name
- ModeSelector component: pill toggle (Normal / Drunk)
- History persists across persona switches (no reset)
- Active persona and mode sent with each POST /api/chat request
- Visual active state for selected persona and mode
- Responsive: tabs collapse on mobile

---

### Milestone 7: Conversation Persistence

**Verify by:** Refresh preserves conversation. GET /api/conversation returns messages. New session starts fresh. Errors return typed responses.

| Epic | Stories | FRs |
|---|---|---|
| M7-S1 | Build ConversationUseCase | FR9 |
| M7-S2 | Create Conversation API route | FR9 |
| M7-S3 | Wire history restore into chat page on load | FR8, FR9 |
| M7-S4 | Add SessionError types and conversation error handling | NFR10 |

**Scope:**
- ConversationUseCase implementing IConversationUseCase
- GET /api/conversation route (Redis already set up in M2)
- SessionError types: SessionNotFoundError, DeserializationError
- Frontend fetches conversation on /chat mount
- Session saved after each chat completion (hooked into M4 chat flow)
- Graceful degradation: missing/expired session returns empty conversation, not error
- 401 for expired/missing JWT
- Error responses: missing session → empty array (not error), Redis failure → empty array + log

**Testing:** Send messages, refresh page → history restored. Clear Redis key → empty conversation returned. Expire cookie → 401.

---

### Milestone 8: Observability & Polish

**Verify by:** Pino logs structured JSON. Errors reported to Better Stack. `tsc --noEmit` passes with full JSDoc coverage.

| Epic | Stories | FRs |
|---|---|---|
| M8-S1 | Implement PinoBetterStackLogger | FR11, FR12 |
| M8-S2 | Integrate location lookup via ip-api.com | FR3 |
| M8-S3 | Wire logging across all use cases | FR11 |
| M8-S4 | Add `no-undocumented-exports` lint check | NFR2-NFR5 |
| M8-S5 | Final README and .env.example audit | — |

**Scope:**
- PinoBetterStackLogger implementing IMetricsLogger
- IpApiLocationService implementing ILocationService
- Structured log events: session_created, conversation_loaded, chat_completed, chat_failed
- Sentry DSN integration for error reporting
- Token usage logged per session
- Location metadata logged during auth (optional, degrades gracefully)
- ESLint rule or pre-commit hook ensuring no undocumented exports
- JSDoc written as code is developed (enforced by lint check, not a cleanup pass)
- Final README update with architecture overview and setup instructions
- .env.example verified complete against all runtime deps

**Testing:** Trigger each flow (auth, chat, conversation) → verify structured JSON in stdout. Provoke error → verify Sentry/Sentry DSN receives it. Run lint → verify undocumented exports fail.

---

## Dependency & Parallelization Notes

- **M2 and M3 are independent** — both depend only on M1. Can be built in parallel by different developers.
- **Redis setup consolidated** — moved from M7 into M2 so the session layer is complete from the start.
- **Error handling built per-use-case** — M2 (AuthError), M4 (ChatError), M7 (SessionError). M8 only adds Sentry forwarding.
- **JSDoc is a continuous discipline** — written as code is written, enforced by a `no-undocumented-exports` lint check in M8.

## FR Coverage Map

FR1: M2-S1 — Landing page auth trigger
FR2: M2-S2, M2-S3 — JWT signing and auth route
FR3: M8-S2 — Location lookup during auth
FR4: M3-S1, M3-S2 — Persona catalog and config files
FR5: M6-S1, M6-S3 — Persona switcher
FR6: M4-S1 to M4-S4, M5-S4 — Chat streaming backend + UI
FR7: M3-S3, M6-S2, M6-S3 — Chat modes
FR8: M7-S1, M7-S4 — Redis session storage
FR9: M7-S2, M7-S3, M7-S4 — Conversation restore
FR10: M4-S3 — Token counting
FR11: M8-S1, M8-S3 — Pino logging
FR12: M8-S1 — Better Stack / Sentry

## Epic List

### Epic 1: Session Foundation & Landing
User lands on the app, gets authenticated with a JWT session automatically.
**Milestones:** M1, M2

### Epic 2: Persona System
User interacts with persona definitions loaded from config, persona-aware chat options built.
**Milestones:** M1, M3

### Epic 3: Core Chat Experience
User selects a persona, sends messages, gets streaming AI responses.
**Milestones:** M4, M5, M6

### Epic 4: Conversation Persistence
User refreshes the page and their chat history is restored.
**Milestones:** M7

### Epic 5: Observability & Quality
Logging, error tracking, token counting, documentation.
**Milestones:** M8
