"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { sendChat } from "@/services/api";

const USER_ID_KEY = "creatorlevel_user_id";

interface Message {
  role: "user" | "bot";
  text: string;
}

const SESSION_ID =
  typeof crypto !== "undefined" ? crypto.randomUUID() : "session-default";

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s*/g, "")        // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")  // bold
    .replace(/\*(.+?)\*/g, "$1")      // italic
    .replace(/__(.+?)__/g, "$1")      // bold alt
    .replace(/_(.+?)_/g, "$1")        // italic alt
    .replace(/`(.+?)`/g, "$1")        // inline code
    .replace(/^\s*[-*]\s+/gm, "• ");  // bullets → •
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hey! I'm your GoDaddy business advisor. Ask me anything about starting or growing your business.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userId =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(USER_ID_KEY)
        : null;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const reply = await sendChat(text, SESSION_ID, userId);
      setMessages((prev) => [...prev, { role: "bot", text: stripMarkdown(reply) }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Make sure the backend is running." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open business advisor chat"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#111111",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          zIndex: 1000,
          fontSize: 22,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#333333")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#111111")
        }
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 380,
            height: 540,
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
            fontFamily: '"GD Sherpa", Arial, Helvetica, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#111111",
              color: "#ffffff",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#00a4a6",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              Business Advisor
            </span>
            <span
              style={{ marginLeft: "auto", fontSize: 11, color: "#aaaaaa" }}
            >
              Powered by GoDaddy
            </span>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "82%",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#111111" : "#f3f5f6",
                  color: msg.role === "user" ? "#ffffff" : "#111111",
                  padding: "9px 13px",
                  borderRadius: 14,
                  borderBottomRightRadius: msg.role === "user" ? 3 : 14,
                  borderBottomLeftRadius: msg.role === "bot" ? 3 : 14,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "#f3f5f6",
                  color: "#6b7575",
                  padding: "9px 13px",
                  borderRadius: 14,
                  borderBottomLeftRadius: 3,
                  fontSize: 13.5,
                  fontStyle: "italic",
                }}
              >
                Typing…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid #e0e5e6",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a business question…"
              disabled={loading}
              style={{
                flex: 1,
                border: "1px solid #d6dada",
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 13.5,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "#00a4a6")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "#d6dada")
              }
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                background: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: 20,
                padding: "8px 16px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim())
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#333333";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#111111";
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
