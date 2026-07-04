"use client";

/**
 * Props for the AIMessageBubble component.
 */
interface AIMessageBubbleProps {
  readonly content: string;
  readonly persona: string;
  readonly avatarUrl?: string;
  readonly isStreaming?: boolean;
}

/**
 * Left-aligned chat bubble for AI messages.
 *
 * Shows a circular avatar, persona label, and the message
 * in a dark bubble. Matches the reference design with
 * `#1e1e1e` background and rounded-xl corners.
 *
 * @param props.content - The message text content.
 * @param props.persona - Display name for the AI persona.
 * @param props.avatarUrl - URL for the persona's avatar image.
 * @param props.isStreaming - Whether the message is still being streamed.
 *
 * @example
 * ```tsx
 * <AIMessageBubble
 *   content="Hello!"
 *   persona="hitesh"
 *   avatarUrl="https://..."
 *   isStreaming={false}
 * />
 * ```
 */
export function AIMessageBubble({
  content,
  persona,
  avatarUrl,
  isStreaming = false,
}: AIMessageBubbleProps) {
  return (
    <div className="ai-bubble-row">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={persona}
          className="ai-bubble-avatar"
        />
      )}
      <div className="ai-bubble-content">
        <span className="ai-bubble-name">{persona}</span>
        <div className="ai-bubble-message">
          {content}
          {isStreaming && (
            <span className="ai-bubble-cursor" />
          )}
        </div>
      </div>
    </div>
  );
}
