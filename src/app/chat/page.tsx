"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChatArea } from "../../components/chat/chat-area";

/**
 * Persona avatar URLs used across the chat page.
 *
 * @example
 * ```tsx
 * <img src={PERSONA_AVATARS.hitesh} alt="Hitesh" />
 * ```
 */
const PERSONA_AVATARS: Readonly<Record<string, string>> = {
  hitesh:
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3OTAzMTh8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTQ5MjM3Nzd8MA&ixlib=rb-4.1.0&q=80&w=100",
  piyush:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3OTAzMTh8MHwxfHNlYXJjaHwxfHxtYW4lMjBmYWNlfGVufDF8fHx8MTc1NDkyMzc3N3ww&ixlib=rb-4.1.0&q=80&w=100",
};

/**
 * Chat page — the main conversation interface.
 *
 * Reads the initial persona from the `persona` query parameter
 * (e.g. `/chat?persona=piyush`), falling back to `hitesh`.
 *
 * Layout matches reference design: top glow, header bar,
 * persona switcher with avatars, centered chat area, and
 * input bar with integrated mode selector.
 */
function ChatContent() {
  const searchParams = useSearchParams();
  const [activePersona, setActivePersona] = useState(
    searchParams.get("persona") || "hitesh",
  );
  const [activeMode, setActiveMode] = useState("normal");

  return (
    <div className="chat-page">
      {/* Radial gradient glow at top */}
      <div className="chat-top-glow" aria-hidden="true" />

      <div className="chat-container">
        {/* Header */}
        <header className="chat-header">
          <Link href="/" className="chat-header-logo">
            <span className="chat-header-logo-icon">🍵</span>
            <span className="chat-header-logo-text">ChaiChat</span>
          </Link>
        </header>

        {/* Persona Switcher */}
        <div className="chat-persona-switcher">
          <button
            onClick={() => setActivePersona("hitesh")}
            className={`chat-persona-btn ${
              activePersona === "hitesh" ? "chat-persona-btn--active" : ""
            }`}
          >
            <img
              src={PERSONA_AVATARS.hitesh}
              alt="Hitesh"
              className="chat-persona-avatar"
            />
            <span className="chat-persona-name">Hitesh</span>
          </button>
          <button
            onClick={() => setActivePersona("piyush")}
            className={`chat-persona-btn ${
              activePersona === "piyush" ? "chat-persona-btn--active" : ""
            }`}
          >
            <img
              src={PERSONA_AVATARS.piyush}
              alt="Piyush"
              className="chat-persona-avatar"
            />
            <span className="chat-persona-name">Piyush</span>
          </button>
        </div>

        {/* Chat Area */}
        <ChatArea
          activePersona={activePersona}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          personaAvatarUrl={PERSONA_AVATARS[activePersona] || PERSONA_AVATARS.hitesh}
        />
      </div>
    </div>
  );
}

/**
 * Wraps ChatContent in a Suspense boundary for useSearchParams.
 */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="chat-page">
          <div className="chat-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <span style={{ color: "#a1a1a1" }}>Loading...</span>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
