/**
 * AgriConnect Nigeria — Image Advisory Component
 * File: /frontend/src/components/image-advisory/ImageAdvisory.jsx
 *
 * Farmer takes/uploads a photo of their crop → AI analyses it →
 * Returns pest/disease identification + advisory in local language.
 *
 * Wires to Alfred's vision pipeline (DeepSeek or similar model).
 *
 * Props:
 *   onAnalyse:   (file: File, language: string) => Promise<AnalysisResult>
 *   language:    string
 *   onAdvisory:  (advisory: AdvisoryResult) => void
 */

import { useState, useRef, useCallback } from "react";

const T = {
  bg:      "var(--color-bg, #faf6ed)",
  surface: "var(--color-surface, #fff)",
  border:  "var(--color-border, #e2c68a)",
  accent:  "var(--color-accent, #c48f2b)",
  text:    "var(--color-text, #2e292b)",
  text2:   "var(--color-text-secondary, #7a5d2c)",
  text3:   "var(--color-text-tertiary, #a8752f)",
  success: "var(--color-success, #3d6b22)",
  successBg: "var(--color-success-bg, #eaf4e0)",
  error:   "var(--color-error, #b03030)",
  errorBg: "var(--color-error-bg, #fdeaea)",
};

/* ─────────────────────────────────────────────────────────────
   UPLOAD ZONE
───────────────────────────────────────────────────────────── */
function UploadZone({ onFile, language }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const labels = {
    en: { title: "Upload crop photo", sub: "Take a photo or upload from gallery", btn: "Choose photo", drag: "Drop photo here" },
    ig: { title: "Bulite foto ọjị", sub: "Were foto ma ọ bụ bulite n'ọnụ ọgụgụ", btn: "Họrọ foto", drag: "Tụpụ foto ebe a" },
    ha: { title: "Ɗaukaka hoto na gonar", sub: "Ɗauki hoto ko zaɓa daga galori", btn: "Zaɓi hoto", drag: "Jefa hoto anan" },
    yo: { title: "Gbe fọto irugbin", sub: "Ya fọto tabi gbe lati ibi aworan", btn: "Yan fọto", drag: "Ju fọto sí ibi" },
  };
  const L = labels[language] || labels.en;

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragging ? T.accent : T.border}`,
        borderRadius: 14, padding: "36px 24px",
        textAlign: "center", cursor: "pointer",
        background: isDragging ? "var(--color-bg-subtle, #f3ecd8)" : T.bg,
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 6 }}>
        {isDragging ? L.drag : L.title}
      </div>
      <div style={{ fontSize: 12, color: T.text2, marginBottom: 18 }}>{L.sub}</div>
      <button
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        style={{
          padding: "10px 20px", borderRadius: 8,
          background: T.accent, color: "#fff", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {L.btn}
      </button>
      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANALYSIS RESULT CARD
───────────────────────────────────────────────────────────── */
function AnalysisResult({ result, language, onReset }) {
  const { condition, confidence, crop, issue, advisory, action, sources, imageUrl } = result;
  const isHealthy = condition === "healthy";

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Image + condition */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
        <img
          src={imageUrl} alt="Crop"
          style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 10,
            border: `2px solid ${T.border}` }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20, marginBottom: 8,
            background: isHealthy ? T.successBg : T.errorBg,
            border: `1px solid ${isHealthy ? "#a8d47a" : "#e08080"}`,
          }}>
            <span style={{ fontSize: 14 }}>{isHealthy ? "✅" : "⚠️"}</span>
            <span style={{
              fontWeight: 700, fontSize: 12,
              color: isHealthy ? T.success : T.error,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {condition} — {confidence}% confidence
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 3 }}>
            {crop} {issue && `· ${issue}`}
          </div>
          <div style={{ fontSize: 11, color: T.text2 }}>
            Analysed by AgriConnect Vision AI
          </div>
        </div>
      </div>

      {/* Advisory */}
      <div style={{
        padding: "12px 14px", background: "var(--color-bg-subtle, #f3ecd8)",
        borderRadius: 10, marginBottom: 12, borderLeft: `3px solid ${T.accent}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.text3,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          Advisory
        </div>
        <p style={{ margin: 0, fontSize: 14, color: T.text, lineHeight: 1.7 }}>{advisory}</p>
      </div>

      {/* Financial action */}
      {action && (
        <div style={{
          padding: "10px 14px", background: T.surface,
          border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 14,
        }}>
          💰 {action}
        </div>
      )}

      {/* Sources */}
      {sources && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 10, color: T.text2, alignSelf: "center" }}>Sources:</span>
          {sources.map((s, i) => (
            <span key={i} style={{
              padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
              background: "var(--color-bg-muted, #ede0c0)", color: T.text2,
            }}>{s}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onReset}
          style={{
            flex: 1, padding: "10px", borderRadius: 8,
            border: `1.5px solid ${T.border}`, background: "transparent",
            color: T.text2, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "Inter, sans-serif",
          }}
        >
          📷 Analyse another photo
        </button>
        <button
          style={{
            flex: 1, padding: "10px", borderRadius: 8,
            border: "none", background: T.accent, color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          💬 Ask follow-up question
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN IMAGE ADVISORY COMPONENT
   Props:
     onAnalyse:  async (file, language) => AnalysisResult
                 AnalysisResult shape:
                 {
                   condition: "healthy"|"diseased"|"pest"|"deficiency",
                   confidence: number (0-100),
                   crop: string,
                   issue: string,
                   advisory: string,
                   action: string,
                   sources: string[],
                 }
     language:   string
     onAdvisory: (result) => void — fires when result is ready
───────────────────────────────────────────────────────────── */
export function ImageAdvisory({ onAnalyse, language = "en", onAdvisory }) {
  const [state, setState] = useState("idle"); // idle | previewing | analysing | done | error
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setState("previewing");
  };

  const handleAnalyse = async () => {
    if (!file) return;
    setState("analysing");
    setError(null);
    try {
      // If no onAnalyse prop provided, use mock for demo
      const analyser = onAnalyse || mockAnalyse;
      const res = await analyser(file, language);
      setResult({ ...res, imageUrl: preview });
      setState("done");
      onAdvisory && onAdvisory(res);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const analyseLabels = {
    en: "Analyse photo", ig: "Nyochaa foto", ha: "Bincika hoto", yo: "Ṣe itupalẹ fọto"
  };

  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: "hidden",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", background: "var(--color-bg-subtle, #f3ecd8)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>🔬</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>
            Crop Photo Advisory
          </div>
          <div style={{ fontSize: 11, color: T.text2 }}>
            Take a photo → AI identifies crop condition → Get advisory
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {state === "idle" && (
          <UploadZone onFile={handleFile} language={language} />
        )}

        {state === "previewing" && (
          <div>
            <img
              src={preview} alt="Preview"
              style={{ width: "100%", maxHeight: 240, objectFit: "cover",
                borderRadius: 10, marginBottom: 14, border: `1px solid ${T.border}` }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  border: `1.5px solid ${T.border}`, background: "transparent",
                  color: T.text2, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ← Retake
              </button>
              <button
                onClick={handleAnalyse}
                style={{
                  flex: 2, padding: "10px", borderRadius: 8,
                  border: "none", background: T.accent, color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                🔬 {analyseLabels[language] || analyseLabels.en}
              </button>
            </div>
          </div>
        )}

        {state === "analysing" && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", border: `3px solid ${T.border}`,
              borderTopColor: T.accent, margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}/>
            <div style={{ fontWeight: 600, color: T.text, marginBottom: 6 }}>
              Analysing your photo...
            </div>
            <div style={{ fontSize: 12, color: T.text2 }}>
              AI is checking for pest, disease, and nutrient issues
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {state === "done" && result && (
          <AnalysisResult result={result} language={language} onReset={handleReset} />
        )}

        {state === "error" && (
          <div style={{
            padding: "16px", background: T.errorBg,
            border: `1px solid #e08080`, borderRadius: 10, marginBottom: 14,
          }}>
            <div style={{ fontWeight: 600, color: T.error, marginBottom: 6 }}>
              ⚠️ Analysis failed
            </div>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 12 }}>{error}</div>
            <button
              onClick={handleReset}
              style={{
                padding: "8px 16px", borderRadius: 7, border: "none",
                background: T.error, color: "#fff", fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Mock analyser for demo — Alfred replaces this with real API call */
async function mockAnalyse(file, language) {
  await new Promise(r => setTimeout(r, 2200));
  return {
    condition: "pest",
    confidence: 87,
    crop: "Maize (Oka)",
    issue: "Fall Armyworm (Spodoptera frugiperda)",
    advisory: language === "ig"
      ? "Achọtara Fall Armyworm n'ọjị gị. Tinye Lambda-cyhalothrin 2.5EC ozugbo. Lekwasị anya ụlọ ọrụ n'izu abuo. Jiri ihe mgbochi ogige elu."
      : "Fall Armyworm detected on your maize crop. Apply Lambda-cyhalothrin 2.5EC immediately. Monitor for 2 weeks. Use overhead spraying for best coverage.",
    action: "Purchase pesticide at your nearest agro-dealer. Use your Crop2Cash CashCard for discounted input purchase.",
    sources: ["IITA Pest Management Guide", "CIMMYT Fall Armyworm Advisory"],
  };
}

export default ImageAdvisory;
