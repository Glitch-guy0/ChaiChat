import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";

/**
 * Landing page for ChaiChat.
 *
 * On mount, fires POST /api/auth with a uuidv4 userId and user-agent
 * header to initialize the session. The response sets an HTTP-only
 * cookie used for subsequent API calls.
 *
 * @example
 * ```tsx
 * // This is the root page — accessible at /
 * // After auth, the user can navigate to /chat
 * ```
 */
export default function Home() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const userId = uuidv4();

    fetch("/api/auth", {
      method: "POST",
      headers: {
        "new-user": "true",
        "user-agent": navigator.userAgent,
      },
    }).catch(() => {
      // Auth failure is non-critical on landing — user can still browse
    });
  }, []);

  return (
    <>
      {/* Background Glows */}
      <div className="bg-glow-container" aria-hidden="true">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      {/* Main Layout Container */}
      <div className="layout-wrapper">
        <main className="glass-container">
          {/* Logo */}
          <div className="logo-container" aria-label="ChaiChat Logo">
            ☕
          </div>

          {/* Badge */}
          <div className="badge">Next.js & TypeScript Active</div>

          {/* Title */}
          <h1 className="title">
            Welcome to <span className="title-accent">ChaiChat</span>
          </h1>

          {/* Description */}
          <p className="description">
            A premium, high-fidelity web application setup. Experience
            real-time connections, sleek dark aesthetics, and seamless
            performance powered by Next.js App Router.
          </p>

          {/* Action Buttons */}
          <div className="actions">
            <a href="/chat" className="btn btn-primary">
              Start Chatting
            </a>
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Documentation
            </a>
          </div>

          {/* Feature Grid */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">App Router Ready</h3>
              <p className="feature-desc">
                Leveraging the latest layouts and Server Components.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">TypeScript Built</h3>
              <p className="feature-desc">
                Strongly typed codebase for rock-solid reliability.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Vanilla CSS</h3>
              <p className="feature-desc">
                Crafted styling using modern CSS variables.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">High Performance</h3>
              <p className="feature-desc">
                Optimized asset loading and fast interactive responses.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>
            Powered by{" "}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>{" "}
            &amp;{" "}
            <a
              href="https://typescriptlang.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              TypeScript
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
