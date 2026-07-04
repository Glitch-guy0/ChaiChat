"use client";

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";

/**
 * Props for the MessageInput component.
 */
interface MessageInputProps {
  readonly onSend: (message: string) => void;
  readonly disabled?: boolean;
  readonly activeMode: string;
  readonly onModeChange: (mode: string) => void;
}

/**
 * Message input bar with integrated mode selector and send button.
 *
 * Renders at the bottom of the chat area. Contains Normal/Drunk
 * mode toggle pills on the left, a text input in the center, and
 * an amber "Send ↑" button on the right. Styled with an amber
 * border and dark background matching the reference design.
 *
 * @param props.onSend - Callback invoked with the trimmed message text.
 * @param props.disabled - Disables input and send during streaming.
 * @param props.activeMode - The currently active chat mode.
 * @param props.onModeChange - Callback to switch chat modes.
 *
 * @example
 * ```tsx
 * <MessageInput
 *   onSend={(msg) => send(msg)}
 *   disabled={isStreaming}
 *   activeMode="normal"
 *   onModeChange={setMode}
 * />
 * ```
 */
export function MessageInput({
  onSend,
  disabled = false,
  activeMode,
  onModeChange,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when component mounts or when re-enabled
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Global keydown event to focus input when user starts typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Do not hijack input if active element is already a form field or contenteditable
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      // Check if pressed key is a single character (printable character)
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="chat-input-bar">
      {/* Text Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled}
        className="chat-input-field"
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="chat-input-send"
        type="button"
      >
        <span>Send</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
}
