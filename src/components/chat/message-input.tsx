"use client";

import { useState, useCallback, type KeyboardEvent } from "react";

interface MessageInputProps {
  readonly onSend: (message: string) => void;
  readonly disabled?: boolean;
}

/**
 * Text input bar with send button.
 *
 * Handles enter-to-send and disables during streaming.
 *
 * @example
 * ```tsx
 * <MessageInput onSend={(msg) => send(msg)} disabled={isStreaming} />
 * ```
 */
export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="border-t border-neutral-800 bg-neutral-900 p-4">
      <div className="flex gap-3 items-end max-w-3xl mx-auto">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-neutral-800 text-neutral-100 rounded-xl px-4 py-3 text-sm resize-none
                     placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:cursor-not-allowed
                     text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
