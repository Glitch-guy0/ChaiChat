"use client";

import { useState, useCallback, type KeyboardEvent } from "react";

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
      {/* Mode Selector */}
      <div className="chat-input-modes">
        <button
          onClick={() => onModeChange("normal")}
          className={`chat-input-mode-btn ${
            activeMode === "normal" ? "chat-input-mode-btn--active" : ""
          }`}
          type="button"
        >
          Normal
        </button>
        <button
          onClick={() => onModeChange("drunk")}
          className={`chat-input-mode-btn ${
            activeMode === "drunk" ? "chat-input-mode-btn--active" : ""
          }`}
          type="button"
        >
          Drunk
        </button>
      </div>

      {/* Text Input */}
      <input
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
