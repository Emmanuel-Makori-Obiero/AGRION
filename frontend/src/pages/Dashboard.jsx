/**
 * AgriConnect Nigeria — Judge Demo Dashboard
 * File: /frontend/src/pages/Dashboard.jsx
 *
 * Shows judges what's happening behind the USSD/Web session in real time:
 * Panel 1 — USSD Session Simulator
 * Panel 2 — Neo4j Graph Query (live Cypher)
 * Panel 3 — Featherless AI Response Generation
 * Panel 4 — SMS/Voice Dispatch Status
 *
 * Wire to real APIs by replacing the mock functions at the bottom.
 * API_BASE defaults to the FastAPI backend from the repo.
 */

import { useState, useEffect, useRef } from "react";

/* ── CONFIG — change this to your deployed FastAPI URL ── */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/* ── TOKENS ── */
const T = {
  bg:       "var(--color-bg, #faf6ed)",
  bg2:      "var(--color-bg-subtle, #f3ecd8)",
  surface:  "var(--color-surface, #fff)",
  border:   "var(--color-border, #e2c68a)",
  accent:   "var(--color-accent, #c48f2b)",
  text:     "var(--color-text, #2e292b)",
  text2:    "var(--color-text-secondary, #7a5d2c)",
  text3:    "var(--color-text-tertiary, #a8752f)",
  terminal: "var(--color-terminal-bg, #0e0c08)",
  termText: "var(--color-terminal-text, #d4a54e)",
  termDim:  "var(--color-terminal-dim, #7a5d2c)",
  success:  "var(--color-success, #3d6b22)",
  successBg:"var(--color-success-bg, #eaf4e0)",
};

/* ─────────────────────────────────────────────────────────────
   PANEL WRAPPER
───────────────────────────────────────────────────────────── */
function Panel({ title, icon, children, accent, style }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${accent ? T.accent : T.border}`,
      borderRadius: 12, overflow: "hidden",
      boxShadow: accent ? "0 0 0 1px rgba(196,143,43,0.3)" : "none",
      ...style,
    }}>
      <div style={{
        padding: "10px 14px",
        background: accent ? T.accent : T.bg2,
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontWeight: 700, fontSize: 12,
          color: accent ? "#fff" : T.text2,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 1 — USSD SESSION SIMULATOR
───────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 0, label: "Language",   options: ["Hausa 🇳🇬", "Igbo 🟢", "Yoruba 🟣", "English 🌍"] },
  { id: 1, label: "Crop",       options: ["Maize / Oka", "Rice / Osikapa", "Cassava / Ji bekee", "Soya"] },
  { id: 2, label: "Region",     options: ["Kano", "Kaduna", "Kebbi", "Lagos", "Oyo", "Enugu"] },
  { id: 3, label: "Farm Stage", options: ["Nkwadebe ala / Pre-planting", "Iku ihe / Planting", "Na-eto / Growing", "Owuwe ihe ubi / Harvest"] },
];

function USSDPanel({ currentStep, selections, advisory, onStep }) {
  const screenTitle = currentStep < STEPS.length
    ? `Screen ${currentStep + 1} of 5 — ${STEPS[currentStep]?.label}`
    : "Screen 5 — Advisory";

  return (
    <div>
      {/* Step tracker */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, position: "relative" }}>
        <div style={{
          position: "absolute", top: 13, left: 13, right: 13,
          height: 2, background: T.border,
        }}/>
        {[...STEPS.map(s => s.label), "Advisory"].map((label, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: i < currentStep ? T.success : i === currentStep ? T.accent : T.surface,
              border: `2px solid ${i <= currentStep ? T.accent : T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700,
              color: i < currentStep ? "#fff" : i === currentStep ? "#fff" : T.text2,
              cursor: "pointer", transition: "all 0.2s",
            }} onClick={() => onStep && onStep(i)}>
              {i < currentStep ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 9, color: i === currentStep ? T.accent : T.text2,
              fontWeight: i === currentStep ? 700 : 400, textAlign: "center" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Phone mockup */}
      <div style={{
        background: "#1a1208", borderRadius: 20, padding: 10,
        boxShadow: `0 0 0 2px #4f3f2e, 0 8px 24px rgba(0,0,0,0.4)`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#3a2e1e", margin: "0 auto" }}/>
        </div>
        <div style={{
          background: T.terminal, borderRadius: 8, padding: 12,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: T.termText, minHeight: 200, position: "relative", overflow: "hidden",
        }}>
          {/* Scanlines */}
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(transparent,transparent 18px,rgba(212,165,78,.025) 18px,rgba(212,165,78,.025) 19px)",
            pointerEvents: "none",
          }}/>
          <div style={{ color: T.termDim, fontSize: 9, borderBottom: `1px solid #1a1208`, paddingBottom: 5, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>*384#</span><span>{screenTitle}</span>
          </div>

          {currentStep < STEPS.length ? (
            <>
              <div style={{ color: "#f1e6b2", marginBottom: 10, fontSize: 10 }}>
                {STEPS[currentStep].label === "Language" ? "Welcome to AgriConnect\nby Crop2Cash." :
                 STEPS[currentStep].label === "Crop" ? "Zaɓi amfanin gona:\n(Choose your crop:)" :
                 STEPS[currentStep].label === "Region" ? "Zaɓi jihar ka:\n(Choose your state:)" :
                 "Menene marhalar noma?\n(Farm stage?)"}
              </div>
              {STEPS[currentStep].options.map((opt, i) => (
                <div key={i} style={{
                  color: T.termText, fontSize: 11, padding: "2px 0",
                  cursor: "pointer",
                  fontWeight: selections[currentStep] === i + 1 ? 700 : 400,
                  color: selections[currentStep] === i + 1 ? "#f1e6b2" : T.termText,
                }} onClick={() => onStep && onStep(currentStep, i + 1)}>
                  <span style={{ color: T.termDim }}>{i + 1}.</span> {opt}
                </div>
              ))}
              {currentStep > 0 && <div style={{ color: T.termDim, fontSize: 10, marginTop: 8 }}>0. Back</div>}
            </>
          ) : (
            <div>
              <div style={{ color: "#f1e6b2", fontSize: 10, marginBottom: 8 }}>
                Kano·Oka·2026 — NDỤMỌDỤ
              </div>
              {advisory ? (
                <>
                  <div style={{ color: T.termText, fontSize: 11, lineHeight: 1.7, marginBottom: 8 }}>
                    {advisory.text || "Chere izu 2 tupu iku ihe.\nJiri SAMMAZ 15.\nOzuzo ga-abia nwayọo."}
                  </div>
                  <div style={{ color: "#d4a54e", fontSize: 11 }}>
                    💰 Chekwaa ₦2,000 na CashCard.
                  </div>
                  <div style={{ color: T.termDim, fontSize: 9, marginTop: 8 }}>SMS ezigara gị ✓</div>
                </>
              ) : (
                <div style={{ color: T.termDim, fontSize: 10 }}>Loading advisory...</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected values */}
      {Object.keys(selections).length > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.entries(selections).map(([step, val]) => (
            <span key={step} style={{
              padding: "2px 9px", borderRadius: 4, fontSize: 10, fontWeight: 600,
              background: T.bg2, color: T.text2, border: `1px solid ${T.border}`,
            }}>
              {STEPS[step]?.options[val - 1]?.split(" / ")[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 2 — NEO4J GRAPH QUERY
───────────────────────────────────────────────────────────── */
function Neo4jPanel({ selections, queryResult, isQuerying }) {
  const crop = STEPS[1]?.options[selections[1] - 1]?.split(" / ")[0] || "Maize";
  const region = STEPS[2]?.options[selections[2] - 1] || "Kano";
  const stage = STEPS[3]?.options[selections[3] - 1]?.split(" / ")[1] || "Pre-planting";

  const cypher = `MATCH (c:Crop {name: "${crop}"})
  -[:GROWN_IN]->(r:Region {name: "${region}"})
  -[:HAS_SEASON]->(s:Season {onset: "late"})
MATCH (c)-[:VULNERABLE_TO]->(p:Pest)
MATCH (r)-[:HAS_FORECAST]->(f:ClimateEvent)
MATCH (fp:FinancialProduct {provider: "Crop2Cash"})
RETURN c, r, s, p, f, fp
LIMIT 10`;

  const nodes = [
    { id: "c", label: crop, type: "Crop", color: "#5a7a3a", icon: "🌽" },
    { id: "r", label: region, type: "Region", color: "#3a5a7a", icon: "📍" },
    { id: "s", label: "Late Onset 2026", type: "Season", color: "#7a5a3a", icon: "🌧️" },
    { id: "f", label: "NiMet SCP", type: "ClimateEvent", color: "#7a3a5a", icon: "🌡️" },
    { id: "fp", label: "CashCard", type: "FinancialProduct", color: "#3a7a5a", icon: "💳" },
  ];

  return (
    <div>
      {/* Cypher query */}
      <div style={{
        background: "#0e0c08", borderRadius: 8, padding: 12,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
        color: "#e2c68a", lineHeight: 1.8, marginBottom: 14,
        position: "relative",
      }}>
        <div style={{ color: "#4f3f2e", fontSize: 9, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          CYPHER QUERY {isQuerying && <span style={{ color: "#d4a54e" }}>● RUNNING</span>}
        </div>
        {cypher.split("\n").map((line, i) => (
          <div key={i} style={{
            color: line.startsWith("MATCH") ? "#d4a54e" :
                   line.startsWith("RETURN") ? "#e2c68a" :
                   line.includes(":") ? "#a8752f" : "#e2c68a",
            opacity: isQuerying && i > 2 ? 0.4 : 1,
            transition: "opacity 0.5s",
          }}>{line}</div>
        ))}
      </div>

      {/* Node graph (CSS-based, no library) */}
      <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Graph Nodes Retrieved
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {nodes.map((node, i) => (
          <div key={node.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            background: T.bg2, borderRadius: 8, border: `1px solid ${T.border}`,
            opacity: isQuerying && i > queryResult?.nodesLoaded - 1 ? 0.3 : 1,
            transition: "opacity 0.4s",
            transform: isQuerying && i <= (queryResult?.nodesLoaded || 0) - 1 ? "none" : "translateX(4px)",
          }}>
            <span style={{ fontSize: 16 }}>{node.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: T.text }}>{node.label}</div>
              <div style={{ fontSize: 10, color: T.text2 }}>:{node.type}</div>
            </div>
            {(!isQuerying || i <= (queryResult?.nodesLoaded || 0) - 1) && (
              <span style={{
                padding: "2px 7px", borderRadius: 4, fontSize: 9,
                fontWeight: 700, background: T.successBg, color: T.success,
              }}>✓ matched</span>
            )}
          </div>
        ))}
      </div>

      {queryResult && (
        <div style={{
          marginTop: 12, padding: "8px 12px", background: T.successBg,
          border: `1px solid #a8d47a`, borderRadius: 8,
          fontSize: 12, color: T.success, fontWeight: 600,
        }}>
          ✓ Graph query complete · {queryResult.nodesLoaded} nodes · {queryResult.relationships} relationships · {queryResult.ms}ms
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 3 — AI RESPONSE GENERATION
───────────────────────────────────────────────────────────── */
function AIPanel({ streamingText, isStreaming, language, isGrounded }) {
  const fullText = "Based on NiMet's 2026 seasonal forecast for Kano and the IITA Maize Production Guide: rainfall onset is expected 2 weeks late. Recommendation: delay planting until mid-May. Use SAMMAZ 15 (drought-tolerant variety). Save ₦2,000 on your Crop2Cash CashCard before input purchase day.";

  return (
    <div>
      {/* Model info */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "Model", value: "Llama 3.1 8B" },
          { label: "Provider", value: "Featherless AI" },
          { label: "Language", value: language === "ig" ? "Igbo" : language === "ha" ? "Hausa" : "English" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            padding: "4px 10px", borderRadius: 6, background: T.bg2,
            border: `1px solid ${T.border}`, fontSize: 11,
          }}>
            <span style={{ color: T.text2 }}>{label}: </span>
            <span style={{ fontWeight: 600, color: T.text }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Prompt pipeline */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          GraphRAG Pipeline
        </div>
        {[
          { step: "1. Intent extraction", status: "done", detail: "crop=Maize, region=Kano, stage=pre-planting" },
          { step: "2. Cypher query", status: "done", detail: "5 nodes retrieved from Neo4j" },
          { step: "3. Context injection", status: "done", detail: "NiMet SCP + IITA facts appended to prompt" },
          { step: "4. Featherless generation", status: isStreaming ? "running" : streamingText ? "done" : "pending", detail: isStreaming ? "Streaming..." : streamingText ? "Advisory generated" : "Waiting..." },
          { step: "5. Hallucination check", status: isGrounded ? "done" : isStreaming ? "running" : "pending", detail: isGrounded ? "✓ Grounded in graph data" : "Checking..." },
        ].map(({ step, status, detail }) => (
          <div key={step} style={{
            display: "flex", gap: 10, padding: "6px 0",
            borderBottom: `1px solid ${T.border}`, alignItems: "flex-start",
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: status === "done" ? T.success : status === "running" ? T.accent : T.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: "#fff", fontWeight: 700,
            }}>
              {status === "done" ? "✓" : status === "running" ? "●" : "○"}
            </span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{step}</div>
              <div style={{ fontSize: 10, color: T.text2 }}>{detail}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Streaming output */}
      <div style={{
        background: "#0e0c08", borderRadius: 8, padding: 12,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        color: "#e2c68a", lineHeight: 1.7, minHeight: 60,
      }}>
        <div style={{ color: "#4f3f2e", fontSize: 9, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          ADVISORY OUTPUT {isStreaming && "● STREAMING"}
        </div>
        {streamingText || fullText.substring(0, isStreaming ? streamingText?.length || 40 : fullText.length)}
        {isStreaming && <span style={{ animation: "blink 0.8s step-end infinite", color: T.accent }}>▋</span>}
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      </div>

      {/* Guardrail */}
      {isGrounded !== undefined && (
        <div style={{
          marginTop: 10, padding: "8px 12px", borderRadius: 8,
          background: isGrounded ? T.successBg : "var(--color-error-bg, #fdeaea)",
          border: `1px solid ${isGrounded ? "#a8d47a" : "#e08080"}`,
          fontSize: 12, fontWeight: 600,
          color: isGrounded ? T.success : "var(--color-error, #b03030)",
        }}>
          {isGrounded
            ? "✓ Hallucination guardrail PASSED — response grounded in Neo4j data"
            : "⚠ Guardrail FIRED — insufficient graph data, declining to answer"}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 4 — SMS/VOICE DISPATCH
───────────────────────────────────────────────────────────── */
function DispatchPanel({ smsStatus, voiceStatus, smsText }) {
  const StatusRow = ({ label, status, detail }) => {
    const colors = {
      queued:    { bg: T.bg2, text: T.text2, dot: T.border },
      sending:   { bg: "rgba(196,143,43,0.1)", text: T.accent, dot: T.accent },
      delivered: { bg: T.successBg, text: T.success, dot: T.success },
      failed:    { bg: "var(--color-error-bg, #fdeaea)", text: "var(--color-error, #b03030)", dot: "var(--color-error, #b03030)" },
    };
    const c = colors[status] || colors.queued;
    return (
      <div style={{
        padding: "10px 12px", borderRadius: 8, marginBottom: 8,
        background: c.bg, border: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0,
          animation: status === "sending" ? "pulse 1s ease-in-out infinite" : "none" }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: T.text }}>{label}</div>
          <div style={{ fontSize: 11, color: T.text2 }}>{detail}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {status}
        </span>
      </div>
    );
  };

  return (
    <div>
      <StatusRow
        label="SMS · Africa's Talking"
        status={smsStatus || "queued"}
        detail={smsStatus === "delivered" ? "+234 *** *** 1234 · 1 segment · 155 chars" : "Waiting for advisory generation..."}
      />
      <StatusRow
        label="Voice IVR · ElevenLabs TTS"
        status={voiceStatus || "queued"}
        detail={voiceStatus === "delivered" ? "Hausa voice · 24s · Delivered to call" : "Awaiting dispatch..."}
      />

      {/* SMS Preview */}
      {smsText && (
        <div style={{
          background: "#0e0c08", borderRadius: 8, padding: 12, marginTop: 8,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e2c68a",
        }}>
          <div style={{ color: "#4f3f2e", fontSize: 9, marginBottom: 6, textTransform: "uppercase" }}>
            SMS CONTENT · {smsText.length}/160 chars
          </div>
          {smsText}
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD PAGE
───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGrounded, setIsGrounded] = useState(undefined);
  const [queryResult, setQueryResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [smsStatus, setSmsStatus] = useState("queued");
  const [voiceStatus, setVoiceStatus] = useState("queued");
  const [advisory, setAdvisory] = useState(null);
  const [language, setLanguage] = useState("ig");

  useEffect(() => {
    document.body.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  /* ── DEMO RUN — replace with real API calls ── */
  const runDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStreamingText(""); setIsGrounded(undefined);
    setQueryResult(null); setSmsStatus("queued");
    setVoiceStatus("queued"); setAdvisory(null);

    // Step through USSD
    const demoSelections = {};
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 600));
      demoSelections[i] = 1;
      setSelections({ ...demoSelections });
      setCurrentStep(i + 1);
    }

    // Neo4j query
    await new Promise(r => setTimeout(r, 400));
    setIsQuerying(true);
    for (let n = 1; n <= 5; n++) {
      await new Promise(r => setTimeout(r, 300));
      setQueryResult({ nodesLoaded: n, relationships: n > 2 ? n - 1 : 0, ms: n * 60 });
    }
    setIsQuerying(false);

    // Featherless streaming
    await new Promise(r => setTimeout(r, 300));
    setIsStreaming(true);
    const advisoryText = language === "ig"
      ? "Chere izu abuo tupu iku ihe. Jiri SAMMAZ 15 (ọ nọgide n'oge ọkọchị). Ozuzo ga-abia nwayọo n'afọ a n'Kano. Chekwaa ₦2,000 na CashCard tupu ịzụta ihe."
      : "Wait 2 weeks before planting. Use SAMMAZ 15 (drought-tolerant). Late rainfall onset forecast for Kano 2026. Save ₦2,000 on CashCard before input day.";

    for (let i = 0; i <= advisoryText.length; i += 4) {
      await new Promise(r => setTimeout(r, 40));
      setStreamingText(advisoryText.substring(0, i));
    }
    setStreamingText(advisoryText);
    setIsStreaming(false);
    setIsGrounded(true);
    setAdvisory({ text: advisoryText });
    setCurrentStep(4);

    // SMS dispatch
    await new Promise(r => setTimeout(r, 500));
    setSmsStatus("sending");
    await new Promise(r => setTimeout(r, 800));
    setSmsStatus("delivered");
    await new Promise(r => setTimeout(r, 300));
    setVoiceStatus("sending");
    await new Promise(r => setTimeout(r, 600));
    setVoiceStatus("delivered");

    setIsRunning(false);
  };

  const resetDemo = () => {
    setCurrentStep(0); setSelections({}); setIsRunning(false);
    setStreamingText(""); setIsStreaming(false); setIsGrounded(undefined);
    setQueryResult(null); setIsQuerying(false);
    setSmsStatus("queued"); setVoiceStatus("queued"); setAdvisory(null);
  };

  const smsText = advisory
    ? `AGRION: Kano·Oka 2026 - ${advisory.text.substring(0, 120)}...`
    : null;

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      fontFamily: "Inter, sans-serif", transition: "background 0.3s",
    }}>
      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: "0 20px", height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: T.accent }}>
            🌾 AgriConnect
          </span>
          <span style={{
            padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: T.bg2, color: T.text2, border: `1px solid ${T.border}`,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Judge Demo Dashboard
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Language */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.border}`,
              background: T.surface, color: T.text, fontSize: 12,
              fontFamily: "Inter, sans-serif", cursor: "pointer",
            }}
          >
            <option value="ig">🟢 Igbo</option>
            <option value="ha">🇳🇬 Hausa</option>
            <option value="en">🌍 English</option>
          </select>
          {/* Dark mode */}
          <button
            onClick={() => setIsDark(d => !d)}
            style={{
              width: 36, height: 20, borderRadius: 10,
              background: T.accent, border: "none", cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: isDark ? 18 : 3,
              width: 14, height: 14, borderRadius: "50%",
              background: "#fff", transition: "left 0.3s",
            }}/>
          </button>
          {/* Run demo */}
          <button
            onClick={isRunning ? resetDemo : runDemo}
            style={{
              padding: "7px 16px", borderRadius: 8, border: "none",
              background: isRunning ? "#8b2e2e" : T.accent,
              color: "#fff", fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            {isRunning ? "⏹ Stop" : "▶ Run Demo"}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "auto auto",
        gap: 14, padding: 20, maxWidth: 1200, margin: "0 auto",
      }}>
        <Panel title="USSD Session" icon="📱" accent style={{ gridRow: "1 / 3" }}>
          <USSDPanel
            currentStep={currentStep}
            selections={selections}
            advisory={advisory}
            onStep={(step, val) => {
              if (val) setSelections(s => ({ ...s, [step]: val }));
            }}
          />
        </Panel>

        <Panel title="Neo4j Knowledge Graph" icon="🕸️">
          <Neo4jPanel
            selections={selections}
            queryResult={queryResult}
            isQuerying={isQuerying}
          />
        </Panel>

        <Panel title="Featherless AI · GraphRAG Pipeline" icon="🤖">
          <AIPanel
            streamingText={streamingText}
            isStreaming={isStreaming}
            isGrounded={isGrounded}
            language={language}
          />
        </Panel>

        <Panel title="Dispatch · Africa's Talking + ElevenLabs" icon="📡" style={{ gridColumn: "2 / 3" }}>
          <DispatchPanel
            smsStatus={smsStatus}
            voiceStatus={voiceStatus}
            smsText={smsText}
          />
        </Panel>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "20px", fontSize: 11,
        color: T.text2, borderTop: `1px solid ${T.border}`,
      }}>
        AgriConnect Nigeria · Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief
        {" · "}
        <span style={{ color: T.accent }}>
          API: {API_BASE}
        </span>
      </div>
    </div>
  );
}
