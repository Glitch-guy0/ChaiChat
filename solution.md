# ChaiChat Architecture Recommendation

## Problem Statement

The current PRD is close to a hexagonal design, but it still has ambiguity in a few places that can weaken maintainability over time:

1. The domain model and transport model are not clearly separated.
2. Persona and mode behavior is described, but not fully normalized into stable domain concepts.
3. JWT, Redis, LLM, location lookup, and logging are all present as external dependencies, but the boundaries between core logic and adapters need to be stated more explicitly.
4. The PRD must support a proof-of-concept scope, so the architecture should stay simple while still allowing external infrastructure to change without touching core use cases.

The main risk is not immediate functionality. The risk is that the implementation slowly drifts away from hexagonal architecture if contracts are too vague or if infrastructure concerns leak into the core.

## Recommendation

Keep the hexagonal architecture, but tighten the contracts around the domain and use cases. The system should treat Redis, JWT, Sentry, location lookup, and the LLM provider as replaceable adapters. The core application should only know about domain concepts and use-case ports.

### What the core should own

- Session lifecycle rules
- Persona selection rules
- Mode selection rules
- Conversation history shape
- Message ordering and persistence decisions
- When to call the LLM port

### What adapters should own

- HTTP request and response handling
- JWT creation and cookie handling
- Redis storage
- External location lookup
- Logging implementation
- LLM provider integration
- Token counting implementation details

## Suggested Domain Model

Define a small set of explicit domain concepts:

- `ChatSession`
- `ChatMessage`
- `Persona`
- `ConversationMode`

These should be stable and independent of transport or storage formats.

## Suggested Use Cases

Keep the application layer focused and small:

- `AuthUseCase`
  - Creates the session identity
  - Initializes session metadata
  - Returns the token/cookie payload for the adapter to store

- `ChatUseCase`
  - Loads session history
  - Applies active persona and mode
  - Calls the LLM port
  - Persists the updated conversation

- `ConversationUseCase`
  - Returns the current conversation history for the authenticated session

## Suggested Architecture Rules

1. Do not let Redis key formats leak into use cases.
2. Do not let JWT claims become the domain model.
3. Do not couple personas to hardcoded enums unless the app truly needs fixed identities.
4. Do not mix transport message shapes with domain message shapes.
5. Keep token counting and logging as adapter concerns, but let the core decide what events should be emitted.
6. Keep all external dependencies behind ports so they can be swapped without changing the use cases.

## Expected Outcome

If the PRD follows these rules, the architecture will remain:

- scalable for a PoC and modest future growth
- maintainable for future adapter changes
- consistent with hexagonal architecture
- easy to extend without rewriting core logic

The result is not a complex architecture. It is a disciplined one: small core, thin adapters, explicit contracts, and minimal coupling.
