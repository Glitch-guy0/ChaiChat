"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChatArea } from "../../components/chat/chat-area";

/**
 * Chat page — the main conversation interface.
 *
 * Reads the initial persona from the `persona` query parameter
 * (e.g. `/chat?persona=piyush`), falling back to `hitesh`.
 *
 * Three-zone layout: top bar (persona switcher + mode selector),
 * chat area (messages + input).
 */
function ChatContent() {
  const searchParams = useSearchParams();
  const [activePersona, setActivePersona] = useState(
    searchParams.get("persona") || "hitesh",
  );
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
              onClick={() => setActivePersona("hitesh")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePersona === "hitesh"
                  ? "bg-green-600/20 text-green-400 ring-1 ring-green-500/30"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              🍵 Hitesh
            </button>
            <button
              onClick={() => setActivePersona("piyush")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePersona === "piyush"
                  ? "bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              🚀 Piyush
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

/**
 * Wraps ChatContent in a Suspense boundary for useSearchParams.
 */
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-400">
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
