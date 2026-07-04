"use client";

interface AIMessageBubbleProps {
  readonly content: string;
  readonly persona: string;
  readonly isStreaming?: boolean;
}

/**
 * Left-aligned chat bubble for AI messages.
 *
 * Shows persona label and optional streaming indicator.
 *
 * @example
 * ```tsx
 * <AIMessageBubble content="Hello!" persona="chai" isStreaming={false} />
 * ```
 */
export function AIMessageBubble({
  content,
  persona,
  isStreaming = false,
}: AIMessageBubbleProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[75%] bg-neutral-800 text-neutral-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
        <p className="text-xs text-neutral-400 mb-1 font-medium capitalize">
          {persona}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-neutral-400 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  );
}
