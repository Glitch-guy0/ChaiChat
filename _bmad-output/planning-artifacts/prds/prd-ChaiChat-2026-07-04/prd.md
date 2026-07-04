---
title: "ChaiChat — Dual-Persona AI Chat Application PRD"
status: draft
created: 2026-07-04
updated: 2026-07-04
author: John (Product Manager)
---

# ChaiChat — Product Requirements Document (PRD)

## 1. Document Control & Overview

- **Title:** ChaiChat — Dual-Persona AI Chat Application
- **Status:** Draft (Pending Review)
- **Author:** John (Product Manager)
- **Date:** 2026-07-04
- **Target Version:** 1.0.0 (Final)

---

## 2. Product Vision & Goals

ChaiChat is a high-fidelity, architecture-heavy showcase application. It demonstrates modern Next.js and TypeScript engineering patterns, including SOLID principles, dependency injection, and clean observability, through a simple two-page conversation interface.

### 2.1 Success Metrics
- **Performance:** Page load time under 1 second; streaming latency (Time to First Token) under 500ms.
- **Architectural Quality:** Zero circular dependencies; 100% compliance with strict SOLID principles; full JSDoc coverage on all public interfaces and service contracts.
- **Extensibility:** Swapping or adding new personas requires editing only a configuration file, without modifying component code or service logic.

---

## 3. User Experience & Core Flows

ChaiChat is a single-user, session-based application. Conversation history is ephemeral and resides strictly in memory (lost on page refresh).

### 3.1 Flow 1: Landing Page (Persona Selection)
- **Page Route:** `/`
- **UI Layout:** Split-screen or card-based layout featuring the two default personas: **Chai** (warm mentor) and **Espresso** (sharp wit).
- **Interactions:** Clicking either card pre-selects that persona and navigates the user to the chat page.

### 3.2 Flow 2: Chat Interface (WhatsApp-Style)
- **Page Route:** `/chat`
- **Top Header:** Display selectors for the two personas. Clicking a persona switches the active talker immediately without resetting the current conversation stream.
- **Left Control:** An hoverable dropdown displaying "Normal" and "Drunk" mode options. Switching modes updates the style of all subsequent messages.
- **Message List:** WhatsApp style. User messages are right-aligned; AI messages are left-aligned. Bubbles show message text, timestamp, and tails.
- **Footer:** Input text box and a Send button. Pressing Enter or clicking Send initiates the response stream.

---

## 4. Technical Architecture & TypeScript Contracts

To ensure compliance with the workspace's engineering standards, all core domains must be governed by strict contracts and interfaces.

### 4.1 Data Models & Interfaces

```typescript
/**
 * Represents the conversational tone modes available in ChaiChat.
 */
export enum ChatMode {
  NORMAL = "NORMAL",
  DRUNK = "DRUNK",
}

/**
 * Defines the core structure of a user persona.
 */
export interface IPersona {
  readonly id: string;
  readonly name: string;
  readonly avatar: string;
  readonly tagline: string;
  readonly systemPromptNormal: string;
  readonly systemPromptDrunk: string;
}

/**
 * Represents a single message in the chat history.
 */
export interface IMessage {
  readonly id: string;
  readonly sender: "user" | "ai";
  readonly personaId: string;
  readonly mode: ChatMode;
  readonly content: string;
  readonly timestamp: Date;
}
```

### 4.2 Service Contracts (SOLID Abstractions)

```typescript
/**
 * Gateway contract for communicating with the LLM provider.
 */
export interface ILLMGateway {
  /**
   * Generates a streaming response from the LLM based on system prompt and history.
   *
   * @param systemPrompt Instructions for the LLM.
   * @param history Previous messages in the conversation.
   * @returns An async generator yielding chunks of the response.
   *
   * @throws {LLMConnectionError} If connection to the provider fails.
   *
   * @example
   * ```ts
   * const stream = await gateway.streamResponse("You are helpful.", history);
   * for await (const chunk of stream) {
   *   console.log(chunk);
   * }
   * ```
   */
  streamResponse(
    systemPrompt: string,
    history: IMessage[]
  ): Promise<AsyncIterable<string>>;
}

/**
 * Service contract for managing personas.
 */
export interface IPersonaService {
  /**
   * Retrieves all available personas.
   *
   * @returns List of defined personas.
   */
  getPersonas(): Promise<IPersona[]>;

  /**
   * Retrieves a persona by its unique identifier.
   *
   * @param id The persona id.
   * @returns The persona or null if not found.
   */
  getPersonaById(id: string): Promise<IPersona | null>;
}

/**
 * Service contract for orchestrating the chat conversation and state.
 */
export interface IChatService {
  /**
   * Sends a user message and returns a stream of the AI's response.
   *
   * @param userMessageText The text sent by the user.
   * @param activePersona The selected persona.
   * @param mode The selected chat mode.
   * @param currentHistory Existing chat session messages.
   * @returns Async generator stream containing the response chunks.
   *
   * @example
   * ```ts
   * const responseStream = await chatService.sendMessage("Hello", persona, ChatMode.NORMAL, history);
   * ```
   */
  sendMessage(
    userMessageText: string,
    activePersona: IPersona,
    mode: ChatMode,
    currentHistory: IMessage[]
  ): Promise<AsyncIterable<string>>;
}
```

---

## 5. Non-Functional & Architecture Requirements

1. **Dependency Injection:** Construct all controllers or page models using constructor-injected services. No service instances should be created using `new` directly inside UI files or page controllers.
2. **Observability:** Use `pino` to write structured, level-based logs. Integrate OpenTelemetry trace spans around `ILLMGateway.streamResponse` and `IChatService.sendMessage` transactions.
3. **CSS System:** Integrate Tailwind CSS v4 alongside modular design custom tokens in `globals.css` to build glassmorphism layers, floating cards, and animated indicators.
