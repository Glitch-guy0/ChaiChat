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
  hitesh: "/images/hitesh.png",
  piyush: "/images/piyush.png",
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

      {/* Top Navigation - Full Width */}
      <nav className="chat-top-nav">
        {/* Header Logo */}
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
      </nav>

      <div className="chat-container">
        {/* Chat Area */}
        <ChatArea
          activePersona={activePersona}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          personaAvatars={PERSONA_AVATARS}
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
