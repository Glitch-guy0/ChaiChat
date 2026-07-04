"use client";

interface UserMessageBubbleProps {
  readonly content: string;
  readonly persona?: string;
}

/**
 * Right-aligned chat bubble for user messages.
 *
 * @example
 * ```tsx
 * <UserMessageBubble content="Hello!" />
 * ```
 */
export function UserMessageBubble({ content }: UserMessageBubbleProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
