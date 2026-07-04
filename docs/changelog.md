# ChaiChat — Changelog

> Implementation delta tracking: planned vs built.

---

## [1.0.0] — 2026-07-05

### Commits (chronological order)

| SHA | Description |
|---|---|
| `036bb1e` | working v1 |
| `7911b22` | output language update |
| `13866f7` | fix: persona sustainability |
| `f93e49e` | fix: updated piyush speech |
| `5319c1b` | feat: updated persona |
| `93952e1` | fix: no code in replay and limit to normal conversational context |
| `9ab1e64` | intent understanding |
| `9a4f3e1` | fix: repetative dialog |
| `b9904f1` | feat: updated landing page design |
| `f1f3c40` | feat: screen 2 implementation complete |
| `2d78671` | fix: minor design issues |

---

### Changes vs Planning Documents

#### 1. Persona Definitions Changed

| Aspect | Planned (product-brief.md) | Built |
|---|---|---|
| Persona A | **Chai** — warm mentor, "philosophical tea voice" | **Hitesh Choudhry** — Backend & System Design Mentor |
| Persona B | **Espresso** — sharp, witty, fast-talking | **Piyush Garg** — AI & GenAI Engineering Mentor |
| Speaking style | Fictional characters | Real-person mentors with Hinglish speech |
| Expertise | Generic "thoughtful mentor" vs "sharp wit" | Concrete: Backend/System Design vs AI/GenAI Engineering |
| Source of truth | Placeholder descriptions | `persona/hitesh.md` and `persona/piyush.md` with YAML frontmatter + markdown body |

#### 2. Landing Page Redesign

| Aspect | Planned | Built |
|---|---|---|
| Layout | Generic "Welcome" page with feature cards (App Router, TypeScript, Vanilla CSS, Performance) | Two persona selection cards side by side |
| Visual identity | Geist font + gradient text title | Chai tea cup logo, amber/gold accents, glassmorphism cards with colored gradient top borders |
| Navigation | "Start Chatting" button | Direct persona card links (`/chat?persona=<id>`) |
| Auth trigger | POST /api/auth with `uuidv4` userId | POST /api/auth with `navigator.userAgent` (no client-generated UUID) |

**File changes:**
- `src/app/page.tsx` — complete rewrite from generic landing to persona card selector
- `src/app/globals.css` — added `.landing-*`, `.persona-card-*` CSS class system

#### 3. Chat Page Redesign

| Aspect | Planned | Built |
|---|---|---|
| Styling | Tailwind utility classes | Custom CSS with design tokens (amber/gold tea theme) |
| Top bar | "← ChaiChat" back link + persona tabs + mode pills | Grid layout: Logo (left) / Persona switcher (center) / empty (right) |
| Mode selector | Hover-reveal dropdown on the left of chat region | Pill toggle integrated into the message input bar (Normal/Drunk) |
| Message bubbles | Tailwind `bg-neutral-800` for AI, `bg-blue-600` for user | Green-tinted AI bubble (`#1e1e1e`), amber-800 user bubble, rounded-xl |
| Avatars | Not specified | Circular avatar images next to AI messages + typing indicator |
| Typing indicator | Not specified | Animated bouncing amber dots with persona avatar |
| Send button | "Send" text button | "Send ↑" with SVG arrow icon |
| Input field | `textarea` with rows=1 | `input type="text"` with amber border |

**File changes:**
- `src/app/chat/page.tsx` — complete rewrite, wrapped in `Suspense` for `useSearchParams`
- `src/app/globals.css` — added `.chat-*` CSS class system (~300 lines)
- `src/components/chat/ai-message-bubble.tsx` — added avatar support, redesigned layout
- `src/components/chat/user-message-bubble.tsx` — redesigned from blue to amber-800
- `src/components/chat/chat-area.tsx` — redesigned layout, `personaAvatars` prop, typing indicator, mode selector passthrough
- `src/components/chat/message-input.tsx` — integrated mode selector pills within input bar

#### 4. Avatar Handling Changed

| Aspect | Planned | Built |
|---|---|---|
| Source | Unsplash stock photos (URLs) | Local `/public/images/hitesh.png` and `/piyush.png` |
| Component prop | `personaAvatarUrl: string` (single URL, ChatArea → AI bubbles) | `personaAvatars: Record<string, string>` (map, ChatArea resolves per-message) |
| Landing page | Emoji icons (`🍵`, `🚀`) | `<img>` tags with local PNGs |

#### 5. Streaming UX Added (Not in Scope)

- Typing indicator with animated bouncing dots before first token arrives
- Blinking cursor on streaming message
- Streaming state spans both the typing indicator and the message bubble

#### 6. JWT Token Payload

| Claim | Planned | Built |
|---|---|---|
| `userId` | `uuidv4` generated client-side | Not stored as separate claim; `sub` derived from hash |
| `userid` | Not specified | `string` in JWT payload |
| Cookie name | Not specified | `auth` |

#### 7. Architecture Deviations

| Aspect | Planned | Built |
|---|---|---|
| `IChatGenerationOptionsBuilder` | Separate interface + implementation | Not used as builder pattern; `ChatGenerationOptionsBuilder` is a utility called directly by `ChatUseCase` |
| DI Container | Route handlers use DI container | Lazy singleton instantiation in route handlers |
| `ITokenCounter` | Imported in architecture | Defined in `src/infrastructure/token-counter/token-counter.ts` (local to infrastructure) |
| `IAuthTokenPayload` | Full interface | Simple type in JWT util |

---

### Integrity Verification

| Check | Status |
|---|---|
| `tsc --noEmit` | Passes |
| `npm run dev` | Starts without errors |
| JSDoc on all exported symbols | ✅ Complete |
| SOLID principles | ✅ Hexagonal architecture, DI, interfaces |
| Streaming via SSE | ✅ Implemented |
| Conversation persistence Redis | ✅ 1-hour TTL |
| Graceful degradation (location) | ✅ Swallows errors, returns null |
| Graceful degradation (Redis) | ✅ Returns empty array on missing session |

---

### Deviations from Epics

| Epic | Status | Notes |
|---|---|---|
| M1 — Domain & Port Contracts | ✅ Complete | All types, ports, domain models exist with JSDoc |
| M2 — Session Auth & Redis | ✅ Complete | JWT auth, Redis session, landing page trigger |
| M3 — Persona System | ✅ Complete | FilePersonaCatalog, persona/*.md, ChatGenerationOptionsBuilder |
| M4 — Chat Backend | ✅ Complete | OpenAI streaming, tiktoken, ChatUseCase, SSE route |
| M5 — Chat Page Core UI | ✅ Complete | ChatArea, bubble components, input, SSE consumption |
| M6 — Persona Switcher & Mode | ✅ Complete | Switcher in top nav, mode pills in input bar |
| M7 — Conversation Persistence | ✅ Complete | ConversationUseCase, GET /api/conversation, history restore |
| M8 — Observability & Polish | ✅ Complete | Pino logging, location service, token counting |
