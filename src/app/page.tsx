"use client";

import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";
import Link from "next/link";

/**
 * Landing page for ChaiChat.
 *
 * Presents two AI persona cards — Hitesh Choudhry and Piyush Garg.
 * Clicking a card navigates to /chat with the persona pre-selected.
 * On mount, fires POST /api/auth to initialize the session.
 *
 * @example
 * ```tsx
 * // Route: /
 * ```
 */
export default function Home() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    fetch("/api/auth", {
      method: "POST",
      headers: {
        "new-user": "true",
        "user-agent": navigator.userAgent,
      },
    }).catch(() => {});
  }, []);

  return (
    <>
      <div className="bg-glow-container" aria-hidden="true">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      <div className="layout-wrapper">
        <main className="landing-content">
          <div className="landing-header">
            <div className="landing-logo" aria-label="ChaiChat Logo">
              ☕
            </div>
            <h1 className="landing-title">
              Welcome to <span className="title-accent">ChaiChat</span>
            </h1>
            <p className="landing-subtitle">
              Pick a mentor and start a conversation.
            </p>
          </div>

          <div className="persona-cards">
            <Link href="/chat?persona=hitesh" className="persona-card persona-card-hitesh">
              <img src="/images/hitesh.png" alt="Hitesh" className="persona-card-image" />
              <h2 className="persona-card-name">Hitesh Choudhry</h2>
              <p className="persona-card-role">Backend &amp; System Design Mentor</p>
              <p className="persona-card-desc">
                Warm, approachable, and full of wisdom. Hitesh breaks down complex
                backend concepts with the clarity of someone who&apos;s taught thousands.
              </p>
              <span className="persona-card-cta">
                Chat with Hitesh
                <span className="persona-card-arrow">&rarr;</span>
              </span>
            </Link>

            <Link href="/chat?persona=piyush" className="persona-card persona-card-piyush">
              <img src="/images/piyush.png" alt="Piyush" className="persona-card-image" />
              <h2 className="persona-card-name">Piyush Garg</h2>
              <p className="persona-card-role">AI &amp; GenAI Engineering Mentor</p>
              <p className="persona-card-desc">
                Sharp, energetic, and always on the cutting edge. Piyush dives deep
                into modern AI engineering, LLMs, and production systems.
              </p>
              <span className="persona-card-cta">
                Chat with Piyush
                <span className="persona-card-arrow">&rarr;</span>
              </span>
            </Link>
          </div>
        </main>

        <footer className="footer">
          <p>
            Powered by{" "}
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
              Next.js
            </a>{" "}
            &amp;{" "}
            <a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer">
              TypeScript
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
