/**
 * AgriConnect Nigeria — Chatbot UI Components
 * File: /frontend/src/components/chatbot/ChatComponents.jsx
 *
 * Props are designed to wire directly to Alfred's Featherless AI pipeline.
 * All components are standalone — import individually or all at once.
 *
 * Usage:
 *   import { ChatWindow, ChatMessage, ChatInput, LanguageSelector,
 *            AdvisoryCard, TypingIndicator, GuardrailBadge }
 *   from './components/chatbot/ChatComponents'
 */

import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   TOKENS (inline fallback — tokens.css should also be imported)
───────────────────────────────────────────────────────────── */
const T = {
  bg:       "var(--color-bg, #faf6ed)",
  surface:  "var(--color-surface, #fff)",
  border:   "var(--color-border, #e2c68a)",
  accent:   "var(--color-accent, #c48f2b)",
  accentH:  "var(--color-accent-hover, #d4a54e)",
  text:     "var(--color-text, #2e292b)",
  text2:    "var(--color-text-secondary, #7a5d2c)",
  text3:    "var(--color-text-tertiary, #a8752f)",
  terminal: "var(--color-terminal-bg, #0e0c08)",
  termText: "var(--color-terminal-text, #d4a54e)",
};

/* ─────────────────────────────────────────────────────────────
   1. LANGUAGE SELECTOR
   Props:
     languages: [{ code, label, nativeLabel, flag }]
     selected:  string (language code)
     onChange:  (code: string) => void
───────────────────────────────────────────────────────────── */
export function LanguageSelector({ languages, selected, onChange }) {
  const defaults = [
    { code: "ha", label: "Hausa",   nativeLabel: "Hausa",   flag: "🇳🇬" },
    { code: "ig", label: "Igbo",    nativeLabel: "Igbo",    flag: "🟢" },
    { code: "yo", label: "Yoruba",  nativeLabel: "Yoruba",  flag: "🟣" },
    { code: "en", label: "English", nativeLabel: "English", flag: "🌍" },
  ];
  const langs = languages || defaults;

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 16px",
      borderBottom: `1px solid ${T.border}`, background: T.surface,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.text2,
        textTransform: "uppercase", letterSpacing: "0.1em",
        alignSelf: "center", marginRight: 4 }}>
        Language:
      </span>
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            cursor: "pointer", transition: "all 0.15s",
            border: `1.5px solid ${selected === l.code ? T.accent : T.border}`,
            background: selected === l.code ? T.accent : "transparent",
            color: selected === l.code ? "#fff" : T.text2,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {l.flag} {l.nativeLabel}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. CHAT MESSAGE BUBBLE
   Props:
     role:      "user" | "assistant" | "system"
     content:   string
     language:  string (code)
     timestamp: string
     isGrounded: boolean — true if response came from Neo4j graph
     sources:   [{ label, type }] — Neo4j nodes used
     isStreaming: boolean — shows streaming cursor
───────────────────────────────────────────────────────────── */
export function ChatMessage({
  role, content, language, timestamp,
  isGrounded, sources, isStreaming
}) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10, marginBottom: 16,
      alignItems: "flex-start",
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: isSystem ? "#e2c68a20" : T.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, border: `2px solid ${T.border}`,
        }}>
          {isSystem ? "⚙️" : "🌾"}
        </div>
      )}

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start" }}>

        {/* Bubble */}
        <div style={{
          padding: "10px 14px", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? T.accent : T.surface,
          border: isUser ? "none" : `1px solid ${T.border}`,
          color: isUser ? "#fff" : T.text,
          fontSize: 14, lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
          boxShadow: "0 1px 3px rgba(46,41,43,0.08)",
        }}>
          {content}
          {isStreaming && (
            <span style={{
              display: "inline-block", width: 2, height: 14,
              background: T.text2, marginLeft: 3, verticalAlign: "middle",
              animation: "blink 0.8s step-end infinite",
            }}/>
          )}
        </div>

        {/* Grounded badge + sources */}
        {!isUser && isGrounded !== undefined && (
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <GuardrailBadge isGrounded={isGrounded} />
            {sources && sources.map((s, i) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: "var(--color-bg-subtle, #f3ecd8)",
                color: T.text2, border: `1px solid ${T.border}`,
              }}>
                {s.type === "crop" ? "🌽" : s.type === "climate" ? "🌧️" : s.type === "finance" ? "💳" : "📊"} {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <span style={{ fontSize: 10, color: T.text2, marginTop: 4 }}>
            {timestamp}
            {language && language !== "en" && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                {language === "ha" ? "🇳🇬 Hausa" : language === "ig" ? "🟢 Igbo" : language === "yo" ? "🟣 Yoruba" : ""}
              </span>
            )}
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "var(--color-bg-muted, #ede0c0)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          👤
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. TYPING INDICATOR
   Props:
     label: string — e.g. "AgriConnect is thinking..."
───────────────────────────────────────────────────────────── */
export function TypingIndicator({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0 12px" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: T.accent, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>
        🌾
      </div>
      <div style={{
        padding: "10px 16px", borderRadius: "16px 16px 16px 4px",
        background: T.surface, border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: T.accent,
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}/>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.text2, fontStyle: "italic" }}>
          {label || "AgriConnect is thinking..."}
        </span>
      </div>
      <style>{`
        @keyframes bounce {
          0%,60%,100%{transform:translateY(0)}
          30%{transform:translateY(-6px)}
        }
        @keyframes blink {
          0%,100%{opacity:1} 50%{opacity:0}
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. GUARDRAIL BADGE
   Shows whether Alfred's hallucination guardrail fired.
   Props:
     isGrounded: boolean
     label:      string (optional override)
───────────────────────────────────────────────────────────── */
export function GuardrailBadge({ isGrounded, label }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: isGrounded
        ? "var(--color-success-bg, #eaf4e0)"
        : "var(--color-error-bg, #fdeaea)",
      color: isGrounded
        ? "var(--color-success, #3d6b22)"
        : "var(--color-error, #b03030)",
      border: `1px solid ${isGrounded ? "#a8d47a" : "#e08080"}`,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {isGrounded ? "✓" : "⚠"} {label || (isGrounded ? "Grounded · Neo4j" : "Out of scope")}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. ADVISORY CARD
   The structured output card shown after AI generates advisory.
   Props:
     crop:      string
     region:    string
     stage:     string
     language:  string
     advisory:  string — the main advisory text
     action:    string — financial CTA
     sources:   [{ label, type }]
     onSaveToCashCard: () => void
     onPlayVoice:      () => void
───────────────────────────────────────────────────────────── */
export function AdvisoryCard({
  crop, region, stage, language,
  advisory, action, sources,
  onSaveToCashCard, onPlayVoice,
}) {
  const langLabel = {
    ha: "Hausa 🇳🇬", ig: "Igbo 🟢", yo: "Yoruba 🟣", en: "English 🌍"
  }[language] || "English 🌍";

  return (
    <div style={{
      background: T.surface,
      border: `1.5px solid ${T.accent}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(196,143,43,0.15)",
      fontFamily: "Inter, sans-serif",
      margin: "8px 0",
    }}>
      {/* Header */}
      <div style={{
        background: T.accent, padding: "10px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
          🌾 Advisory — {crop} · {region}
        </span>
        <span style={{
          background: "rgba(255,255,255,0.2)", padding: "2px 8px",
          borderRadius: 4, fontSize: 10, fontWeight: 600, color: "#fff",
        }}>
          {langLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.text3,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
        }}>
          {stage} Advisory
        </div>
        <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, margin: 0, marginBottom: 12 }}>
          {advisory}
        </p>

        {/* Financial CTA */}
        {action && (
          <div style={{
            padding: "10px 14px", background: "var(--color-bg-subtle, #f3ecd8)",
            borderRadius: 8, borderLeft: `3px solid ${T.accent}`,
            fontSize: 13, color: T.text, marginBottom: 12,
          }}>
            💰 {action}
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 10, color: T.text2, alignSelf: "center" }}>Sources:</span>
            {sources.map((s, i) => (
              <span key={i} style={{
                padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: "var(--color-bg-muted, #ede0c0)", color: T.text2,
              }}>
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          {onPlayVoice && (
            <button
              onClick={onPlayVoice}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 8,
                border: `1.5px solid ${T.accent}`, background: "transparent",
                color: T.accent, fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              🎙️ Play Voice Advisory
            </button>
          )}
          {onSaveToCashCard && (
            <button
              onClick={onSaveToCashCard}
              style={{
                flex: 1, padding: "9px 14px", borderRadius: 8,
                border: "none", background: T.accent,
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              💳 Save to CashCard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. CHAT INPUT BAR
   Props:
     onSend:       (message: string) => void
     onImageUpload:(file: File) => void — for crop photo advisory
     placeholder:  string
     disabled:     boolean — true while AI is responding
     language:     string — current language code
───────────────────────────────────────────────────────────── */
export function ChatInput({ onSend, onImageUpload, placeholder, disabled, language }) {
  const [value, setValue] = useState("");
  const fileRef = useRef();

  const placeholders = {
    ha: "Rubuta tambayar ka...",
    ig: "Dee ajụjụ gị...",
    yo: "Kọ ibeere rẹ...",
    en: "Ask about your farm...",
  };

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{
      padding: "12px 16px",
      borderTop: `1px solid ${T.border}`,
      background: T.surface,
      display: "flex", gap: 8, alignItems: "flex-end",
    }}>
      {/* Image upload button */}
      {onImageUpload && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            title="Upload crop photo for AI analysis"
            style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              border: `1.5px solid ${T.border}`, background: "transparent",
              color: T.text2, fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            📷
          </button>
          <input
            ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => e.target.files[0] && onImageUpload(e.target.files[0])}
          />
        </>
      )}

      {/* Text input */}
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholders[language] || placeholders.en}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1, padding: "10px 14px", borderRadius: 10,
          border: `1.5px solid ${T.border}`,
          background: "var(--color-bg-subtle, #f3ecd8)",
          color: T.text, fontSize: 14, resize: "none",
          fontFamily: "Inter, sans-serif", outline: "none",
          opacity: disabled ? 0.6 : 1,
          transition: "border-color 0.15s",
          lineHeight: 1.5,
        }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          border: "none",
          background: disabled || !value.trim() ? T.border : T.accent,
          color: "#fff", fontSize: 18, cursor: disabled ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.15s",
        }}
      >
        ➤
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. QUICK REPLY CHIPS
   Suggested prompts the farmer can tap instead of typing.
   Props:
     suggestions: [{ label, value, icon }]
     onSelect:    (value: string) => void
     language:    string
───────────────────────────────────────────────────────────── */
export function QuickReplies({ suggestions, onSelect, language }) {
  const defaults = {
    en: [
      { label: "Planting advice", value: "When should I plant my maize?", icon: "🌱" },
      { label: "Weather forecast", value: "What is the weather forecast for Kano?", icon: "🌧️" },
      { label: "Pest alert", value: "How do I treat fall armyworm?", icon: "🐛" },
      { label: "Save with CashCard", value: "How do I save money for inputs?", icon: "💳" },
    ],
    ig: [
      { label: "Ndụmọdụ iku ihe", value: "Kedu mgbe m ga-eku oka?", icon: "🌱" },
      { label: "Ihe gbasara igwe", value: "Kedu ihe igwe ozuzo ga-abụ n'Kano?", icon: "🌧️" },
      { label: "Ọrịa ugbo", value: "Kedu ka m ga-esi lọọ ọrịa?", icon: "🐛" },
      { label: "CashCard", value: "Kedu ka m ga-esi chekwaa ego?", icon: "💳" },
    ],
    ha: [
      { label: "Nasiha dasa", value: "Yaushe ya kamata in dasa masara?", icon: "🌱" },
      { label: "Yanayi", value: "Menene yanayin ruwan sama a Kano?", icon: "🌧️" },
      { label: "Kwari", value: "Yaya zan bi da kwari?", icon: "🐛" },
      { label: "CashCard", value: "Yaya zan ajiye kuɗi?", icon: "💳" },
    ],
  };

  const chips = suggestions || defaults[language] || defaults.en;

  return (
    <div style={{
      display: "flex", gap: 8, flexWrap: "wrap",
      padding: "10px 16px", borderTop: `1px solid ${T.border}`,
    }}>
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(c.value)}
          style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${T.border}`,
            background: "transparent", color: T.text2,
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.15s",
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = T.accent;
            e.currentTarget.style.color = T.accent;
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.color = T.text2;
          }}
        >
          <span>{c.icon}</span>{c.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   8. CHAT WINDOW (assembles all components)
   Props:
     messages:        ChatMessage[]
     isLoading:       boolean
     language:        string
     onLanguageChange:(code) => void
     onSend:          (msg) => void
     onImageUpload:   (file) => void
     onQuickReply:    (value) => void
     title:           string
     subtitle:        string
───────────────────────────────────────────────────────────── */
export function ChatWindow({
  messages = [],
  isLoading = false,
  language = "en",
  onLanguageChange,
  onSend,
  onImageUpload,
  onQuickReply,
  title,
  subtitle,
}) {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", minHeight: 500,
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(46,41,43,0.12)",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        background: T.accent,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          🌾
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>
            {title || "AgriConnect Nigeria"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>
            {subtitle || "AI-powered farm advisory · Crop2Cash"}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#7ab84a",
            boxShadow: "0 0 0 3px rgba(122,184,74,0.3)",
          }}/>
        </div>
      </div>

      {/* Language selector */}
      {onLanguageChange && (
        <LanguageSelector selected={language} onChange={onLanguageChange} />
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        background: "var(--color-bg, #faf6ed)",
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.text2 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {language === "ig" ? "Nnọọ na AgriConnect" :
               language === "ha" ? "Barka da zuwa AgriConnect" :
               "Welcome to AgriConnect Nigeria"}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              {language === "ig" ? "Jụọ m ajụjụ gbasara ugbo gị." :
               language === "ha" ? "Yi mani tambaya game da gona ka." :
               "Ask me anything about your farm, crops, weather, or finances."}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} language={language} />
        ))}

        {isLoading && <TypingIndicator label={
          language === "ig" ? "AgriConnect na-echefu..." :
          language === "ha" ? "AgriConnect yana tunani..." :
          "AgriConnect is thinking..."
        } />}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {onQuickReply && messages.length < 2 && (
        <QuickReplies onSelect={onQuickReply} language={language} />
      )}

      {/* Input */}
      <ChatInput
        onSend={onSend}
        onImageUpload={onImageUpload}
        disabled={isLoading}
        language={language}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DEMO: shows all components with mock data
   Remove this export before production
───────────────────────────────────────────────────────────── */
export function ChatDemo() {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! I'm AgriConnect, your farm advisory assistant powered by Crop2Cash and NiMet data. Ask me about planting, weather, pests, or your CashCard.",
      timestamp: "09:00",
      isGrounded: true,
      sources: [{ label: "NiMet SCP 2026", type: "climate" }, { label: "IITA Maize Guide", type: "crop" }],
    },
    {
      role: "user",
      content: "When should I plant my maize in Kano this season?",
      timestamp: "09:01",
    },
    {
      role: "assistant",
      content: "Based on NiMet's 2026 seasonal forecast for Kano, rains are expected to arrive 2 weeks later than usual. I recommend waiting until mid-May before planting. Use SAMMAZ 15 — it's drought-tolerant and well-suited for late-onset seasons in Northern Nigeria.",
      timestamp: "09:01",
      isGrounded: true,
      sources: [
        { label: "NiMet Kano 2026", type: "climate" },
        { label: "IITA Maize Guide", type: "crop" },
      ],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (msg) => {
    setMessages(prev => [...prev, { role: "user", content: msg, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Based on data from our Neo4j knowledge graph (NiMet + IITA sources), here is your advisory: Save ₦2,000 on your Crop2Cash CashCard before input purchase day. This is your most important financial action this pre-planting season.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isGrounded: true,
        sources: [{ label: "Crop2Cash CashCard", type: "finance" }],
      }]);
      setIsLoading(false);
    }, 1800);
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", height: 620, padding: 16 }}>
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        language={language}
        onLanguageChange={setLanguage}
        onSend={handleSend}
        onImageUpload={(file) => alert(`Image received: ${file.name} — Alfred's vision API will process this`)}
        onQuickReply={handleSend}
      />
    </div>
  );
}
