"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { UserMessageBubble } from "./user-message-bubble";
import { AIMessageBubble } from "./ai-message-bubble";
import { MessageInput } from "./message-input";

/**
 * Single chat message model.
 */
interface Message {
  readonly id: string;
  readonly sender: "user" | "assistant";
  readonly persona: string;
  readonly content: string;
}

/**
 * Props for the ChatArea component.
 */
interface ChatAreaProps {
  readonly activePersona: string;
  readonly activeMode: string;
  readonly onModeChange: (mode: string) => void;
  readonly personaAvatars: Readonly<Record<string, string>>;
}

/**
 * Main chat container with message list, streaming, and input.
 *
 * Fetches conversation history on mount. Streams new responses
 * via SSE. Includes the message input bar at the bottom with
 * an integrated mode selector.
 *
 * @param props.activePersona - Currently selected persona identifier.
 * @param props.activeMode - Current chat mode ("normal" | "drunk").
 * @param props.onModeChange - Callback to change the chat mode.
 * @param props.personaAvatarUrl - Avatar URL for the active persona.
 *
 * @example
 * ```tsx
 * <ChatArea
 *   activePersona="hitesh"
 *   activeMode="normal"
 *   onModeChange={setMode}
 *   personaAvatarUrl="https://..."
 * />
 * ```
 */
export function ChatArea({
  activePersona,
  activeMode,
  onModeChange,
  personaAvatars,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    fetch("/api/conversation")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ sender: string; persona: string; content: string }>) => {
        const restored: Message[] = data.map((msg, i) => ({
          id: `restored-${i}`,
          sender: msg.sender as "user" | "assistant",
          persona: msg.persona,
          content: msg.content,
        }));
        setMessages(restored);
      })
      .catch(() => {});
  }, []);

  const handleSend = useCallback(
    async (prompt: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        persona: activePersona,
        content: prompt,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            personaId: activePersona,
            mode: activeMode,
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data) as { token?: string; error?: string };
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.token) {
                  fullContent += parsed.token;
                  setStreamingContent(fullContent);
                }
              } catch {
                // Skip malformed SSE lines
              }
            }
          }
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: "assistant",
          persona: activePersona,
          content: fullContent,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          sender: "assistant",
          persona: activePersona,
          content: "Sorry, something went wrong. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [activePersona, activeMode],
  );

  return (
    <div className="chat-area">
      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && !isStreaming && (
          <div className="chat-messages-empty">
            Start a conversation...
          </div>
        )}

        {messages.map((msg) =>
          msg.sender === "user" ? (
            <UserMessageBubble key={msg.id} content={msg.content} />
          ) : (
            <AIMessageBubble
              key={msg.id}
              content={msg.content}
              persona={msg.persona}
              avatarUrl={personaAvatars[msg.persona] || personaAvatars.hitesh}
            />
          ),
        )}

        {isStreaming && streamingContent && (
          <AIMessageBubble
            content={streamingContent}
            persona={activePersona}
            avatarUrl={personaAvatars[activePersona] || personaAvatars.hitesh}
            isStreaming
          />
        )}

        {isStreaming && !streamingContent && (
          <div className="chat-typing-indicator">
            <img
              src={personaAvatars[activePersona] || personaAvatars.hitesh}
              alt={activePersona}
              className="chat-typing-avatar"
            />
            <div className="chat-typing-dots">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={isStreaming}
        activeMode={activeMode}
        onModeChange={onModeChange}
      />
    </div>
  );
}
