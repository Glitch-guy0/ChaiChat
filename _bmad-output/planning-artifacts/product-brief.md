---
title: "ChaiChat — Dual-Persona AI Chat Application"
status: implemented
created: 2026-07-04
updated: 2026-07-05
---

# ChaiChat — Product Brief

## Elevator Pitch

ChaiChat is a two-page web application where users select one of two AI personas from a visually striking landing page and enter a WhatsApp-style chat interface. During conversation, users can switch personas without losing chat history and toggle between "Normal" and "Drunk" response modes — creating four distinct conversational voices. The product exists as an **architecture showcase**: clean separation of concerns, strong typing, dependency injection, and production-grade patterns matter more than feature breadth.

---

## Problem & Motivation

This is not a market-gap product. ChaiChat is a **deliberate architecture exercise** — a constrained scope application designed to demonstrate best-practice backend and frontend engineering in a Next.js + TypeScript stack. The personas and chat modes provide just enough surface area to exercise real patterns (service abstraction, prompt engineering, state management, streaming) without drowning in product complexity.

**Why it matters:** Architecture quality is invisible until it isn't. ChaiChat proves that even a "simple" app can be built with the rigor of a production system — SOLID principles, interface-driven design, clean error handling, and observable infrastructure.

---

## Core Experience

### Page 1 — Landing Page (Persona Selection)

- Two personas presented side by side in a visually premium layout.
- Each persona has a distinct visual identity (name, avatar/illustration, short tagline).
- Clicking a persona navigates to the Chat Page with that persona pre-selected.
- No authentication, no onboarding — zero friction entry.

### Page 2 — Chat Page (Conversation Interface)

**Persona Switcher (Top Bar)**
- Both personas visible at the top of the chat page as selectable tabs/buttons.
- User can switch the active persona at any time mid-conversation.
- Switching personas does **not** reset or clear the conversation history.
- The AI simply begins responding as the newly selected persona from that point forward.

**Chat Mode Selector (Input Bar)**
- Pill toggle integrated into the message input bar (left side).
- Two options: **"Normal"** and **"Drunk"** pill buttons.
- Selecting a mode changes the tone/style of all *future* AI responses.
- Default mode: Normal.
- "Drunk" mode produces looser, more chaotic, humorous responses (temperature 0.5).

**Chat Interface (WhatsApp-Style)**
- User messages: right-aligned bubbles.
- AI messages: left-aligned bubbles.
- Message tails, timestamps, smooth scroll-to-bottom behavior.
- Text input bar at the bottom with a send button.
- Streaming responses (tokens appear in real-time as the AI generates).

---

## Personas

The architecture supports any two persona definitions loaded from configuration. Personas can be swapped by editing a config file — zero code changes required.

Each persona is defined by:
- **Name** — display name shown in UI.
- **Avatar** — visual representation.
- **Tagline** — short description shown on the landing page card.
- **System Prompt (Normal)** — the base personality and behavior instructions sent to the LLM.
- **System Prompt (Drunk)** — a modified system prompt that layers chaotic, humorous, loosened behavior on top of the base personality.

### Default Personas (Configurable Placeholders)

| Persona | Name | Personality | Normal Style | Drunk Style |
|---|---|---|---|---|
| **Hitesh** | **Hitesh Choudhry** | Backend & System Design Mentor. Warm, approachable, Hinglish speech with "ji" suffix. | Measured, insightful, mentor-like | Loose, tangential backend rants |
| **Piyush** | **Piyush Garg** | AI & GenAI Engineering Mentor. Energetic, sharp, thinks out loud in Hinglish. | Rapid-fire, clever, intuition-first | Unfiltered hot takes, chaotic energy |

> **Note:** The original brief specified "Chai" and "Espresso" as placeholder personas. The implementation uses real mentor personas (Hitesh Choudhry, Piyush Garg) with distinct visual identities and system prompts. Persona definitions live in `persona/*.md` files.

---

## What This Is NOT

- **Not a multi-user platform.** Single user, no auth, no persistence across sessions.
- **Not a product to ship to customers.** No analytics, no A/B testing, no growth features.
- **Not feature-rich by design.** Two pages, two personas, two modes. That's the scope ceiling.
- **Not a competitor to any chat product.** This is an architecture reference implementation.

---

## Architecture Priorities (Non-Functional Requirements)

These are the real deliverables — the chat UI is the vehicle, the architecture is the cargo:

| Priority | Description |
|---|---|
| **SOLID Compliance** | Every service, repository, and component follows Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles. |
| **Interface-Driven Design** | All services have interfaces. No direct coupling to concrete implementations. |
| **Strong Typing** | Named types and interfaces for every API boundary. No `any`, no anonymous object types crossing module boundaries. |
| **Dependency Injection** | Services receive dependencies via constructor. No internal instantiation of collaborators. |
| **Observability** | Structured logging via Pino. OpenTelemetry instrumentation for tracing request flows. |
| **Clean Separation of Concerns** | Prompt engineering, LLM communication, message formatting, state management, and UI rendering are each in their own layer. |
| **JSDoc Documentation** | Every exported class, interface, type, function, and method has full JSDoc with examples. |
| **Error Handling** | Explicit error types. No swallowed errors. Documented throws in JSDoc. |
| **Immutability** | Prefer `readonly`, `ReadonlyArray`, pure functions. Minimize mutation. |
| **Testability** | Architecture designed for easy unit testing via interfaces and DI — even if tests are not written in v1. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + Vanilla CSS (custom design tokens) |
| LLM Provider | OpenAI (GPT models via `openai` SDK) |
| Tokenization | `tiktoken` (token counting for context management) |
| ORM | TypeORM (with `reflect-metadata`) + PostgreSQL / SQLite drivers |
| Logging | Pino (+ `pino-pretty` for dev) |
| Observability | OpenTelemetry (`@opentelemetry/sdk-node`, auto-instrumentations) |
| Environment | `dotenv` |

---

## Conversation State

- **Persistent within session.** Chat history is stored in Redis with 1-hour TTL, keyed by JWT token hash. Refreshing the page restores the conversation.
- **Context window management.** `tiktoken` tracks token usage per prompt/response. Conversation truncation is not yet implemented but the architecture supports it.
- **Session auth.** JWT HTTP-only cookie gates all API endpoints. Redis session has matching 1-hour TTL.

---

## Scope Boundaries

### In Scope (v1 — Implemented)
- Landing page with two persona cards (Hitesh, Piyush) with avatars and click-to-chat navigation.
- Chat page with persona switcher (top navigation), mode pills (input bar), WhatsApp-style bubbles.
- OpenAI integration with streaming responses (SSE).
- Four voice combinations (2 personas × 2 modes).
- Premium dark-theme styling with tea-themed amber/gold design tokens.
- Session auth via JWT HTTP-only cookie.
- Conversation persistence in Redis (1-hour TTL, restores on refresh).
- Token counting via `tiktoken` (logged per session).
- Clean, well-documented, SOLID-compliant hexagonal architecture.
- Pino structured logging.
- Optional IP geolocation logging during auth.

### Out of Scope (Permanently)
- Authentication / user accounts.
- Multi-user / real-time collaboration.
- Message persistence across sessions.
- Mobile native apps.
- Multiple LLM provider support.
- Voice input/output.
- File/image sharing in chat.
- Competitive analysis or market positioning.

---

## Success Criteria

1. A developer reading the codebase can understand the architecture in under 15 minutes by following interfaces and dependency graphs.
2. Swapping a persona requires changing only configuration — zero code changes in services or components.
3. Adding a third chat mode (e.g., "Philosophical") requires implementing one new prompt template and zero changes to the chat service interface.
4. The UI feels premium — dark theme, smooth animations, responsive layout, WhatsApp-caliber polish.
5. Every exported symbol has JSDoc documentation with examples.

---

## Resolved Decisions

| # | Decision | Resolution | Rationale |
|---|---|---|---|
| D1 | Persona definitions | Placeholder personas "Chai" (warm mentor) and "Espresso" (sharp wit) — swappable via config | Architecture showcase; specific characters are secondary to the pattern |
| D2 | Response delivery | Token-by-token streaming | Demonstrates async patterns, SSE/streaming architecture, and provides better UX |
| D3 | TypeORM in v1 | Architecture readiness only — no active database wiring for messages | User specified simple app; TypeORM entities and repositories can be wired later without interface changes |
