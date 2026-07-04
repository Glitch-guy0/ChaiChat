# ChaiChat — Dual-Persona AI Chat Application

Connect and converse with your favorite mentors. ChaiChat is a two-page AI chat app where you choose between **Hitesh Choudhry** (Backend & System Design Mentor) and **Piyush Garg** (AI & GenAI Engineering Mentor), then toggle between **Normal** and **Drunk** response modes for four distinct conversational voices.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS v4, Custom CSS design tokens |
| LLM | OpenAI SDK (streaming completions) |
| Tokenization | `js-tiktoken` (GPT-4 encoding) |
| Session | Redis via `ioredis` (1-hour TTL) |
| Auth | JWT via `jose` (HMAC-SHA256, HTTP-only cookies) |
| Logging | Pino (pino-pretty in dev, Better Stack in production) |
| Geolocation | ip-api.com (optional, graceful degradation) |

## Architecture

Hexagonal (ports & adapters) architecture with strict layer separation:

```
Primary Adapters (app/api/*) → Application Core (use-cases) → Ports (interfaces) → Infrastructure Adapters
```

## Getting Started

```bash
cp .env.example .env.local
# Fill in your OPENAI_API_KEY and REDIS_URL

docker compose up -d   # Starts Redis
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    api/auth/       # POST /api/auth — session initialization
    api/chat/       # POST /api/chat — SSE streamed chat completions
    api/conversation/ # GET /api/conversation — history restore
    chat/           # Chat page with persona switcher
    page.tsx        # Landing page with persona cards
  application/      # Use cases (AuthUseCase, ChatUseCase, ConversationUseCase)
  components/chat/  # Client components (ChatArea, MessageInput, bubbles)
  domain/           # Domain models (ChatSession)
  errors/           # Typed error classes (AuthError, ChatError)
  infrastructure/   # Adapters (Redis, OpenAI, Pino, IP-API, FilePersonaCatalog)
  ports/            # Driven port interfaces
  types/            # Domain contracts and utility types
persona/            # Persona definitions (Markdown + frontmatter)
```

## Key Features

- **Two AI personas** with distinct system prompts and visual identities
- **Normal / Drunk** chat modes (temperature 0 vs 0.5)
- **Real-time streaming** via Server-Sent Events
- **Session persistence** in Redis with 1-hour TTL
- **Conversation restore** on page refresh via JWT-authenticated API
- **Dark theme** with amber/gold tea-inspired design system
- **Optional location metadata** via IP geolocation

## Environment Variables

See `.env.example` for all required and optional variables.
