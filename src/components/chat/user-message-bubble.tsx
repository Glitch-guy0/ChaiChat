"use client";

/**
 * Props for the UserMessageBubble component.
 */
interface UserMessageBubbleProps {
  readonly content: string;
  readonly persona?: string;
}

/**
 * Right-aligned chat bubble for user messages.
 *
 * Uses an amber/brown background to match the chai gold theme
 * from the reference design (amber-800).
 *
 * @param props.content - The message text content.
 * @param props.persona - Optional persona context (unused visually).
 *
 * @example
 * ```tsx
 * <UserMessageBubble content="Hello!" />
 * ```
 */
export function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="user-bubble-row">
      <div className="user-bubble-message">
        {content}
      </div>
    </div>
  );
}
