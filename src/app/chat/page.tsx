"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatArea } from "../../components/chat/chat-area";

/**
 * Chat page — the main conversation interface.
 *
 * Three-zone layout: top bar (persona switcher + mode selector),
 * chat area (messages + input).
 *
 * @example
 * ```tsx
 * // Route: /chat
 * ```
 */
export default function ChatPage() {
  const [activePersona, setActivePersona] = useState("chai");
  const [activeMode, setActiveMode] = useState("normal");

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        <Link
          href="/"
          className="text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
        >
          ← ChaiChat
        </Link>

        <div className="flex items-center gap-4">
          {/* Persona Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setActivePersona("chai")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePersona === "chai"
                  ? "bg-amber-600/20 text-amber-400 ring-1 ring-amber-500/30"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              ☕ Chai
            </button>
            <button
              onClick={() => setActivePersona("espresso")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePersona === "espresso"
                  ? "bg-orange-600/20 text-orange-400 ring-1 ring-orange-500/30"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              ⚡ Espresso
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setActiveMode("normal")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMode === "normal"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setActiveMode("drunk")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeMode === "drunk"
                  ? "bg-neutral-700 text-neutral-100"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Drunk
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <ChatArea activePersona={activePersona} activeMode={activeMode} />
    </div>
  );
}
