import Link from "next/link";

export default function Home() {
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
            A premium, high-fidelity web application setup. Experience real-time connections, sleek dark aesthetics, and seamless performance powered by Next.js App Router.
          </p>

          {/* Action Buttons */}
          <div className="actions">
            <Link href="#start" className="btn btn-primary">
              Start Chatting
            </Link>
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
              <p className="feature-desc">Leveraging the latest layouts and Server Components.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">TypeScript Built</h3>
              <p className="feature-desc">Strongly typed codebase for rock-solid reliability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Vanilla CSS</h3>
              <p className="feature-desc">Crafted styling using modern CSS variables.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">High Performance</h3>
              <p className="feature-desc">Optimized asset loading and fast interactive responses.</p>
            </div>
          </div>
        </main>

        {/* Footer */}
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
