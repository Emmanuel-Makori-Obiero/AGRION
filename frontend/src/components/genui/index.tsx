import type { GenUIBlock } from "./types";
import { ActionAlert } from "./ActionAlert";
import { FinancialYieldChart } from "./FinancialYieldChart";
import { WeatherCard } from "./WeatherCard";
import { AIPipeline } from "./AIPipeline";
import { USSDSimulator } from "./USSDSimulator";
import { AIChatInterface } from "./AIChatInterface";
import { HallucinationGuardrail } from "./HallucinationGuardrail";
import { MultilingualSupport } from "./MultilingualSupport";
import { IVRSimulator } from "./IVRSimulator";
import { VoiceScript } from "./VoiceScript";
import { TTSOutput } from "./TTSOutput";
import { SMSPreview } from "./SMSPreview";
import { VisionPipeline } from "./VisionPipeline";
import { PrivacyConsent } from "./PrivacyConsent";

/**
 * Renders a single AI block by dispatching on its discriminator. New block
 * types are added here alongside their component.
 */
export function GenUIRenderer({ block }: { block: GenUIBlock }) {
  switch (block.type) {
    case "weather":
      return <WeatherCard block={block} />;
    case "financial_yield":
      return <FinancialYieldChart block={block} />;
    case "action_alert":
      return <ActionAlert block={block} />;
    case "ai_pipeline":
      return <AIPipeline block={block} />;
    case "ussd_simulator":
      return <USSDSimulator block={block} />;
    case "ai_chat":
      return <AIChatInterface block={block} />;
    case "guardrail":
      return <HallucinationGuardrail block={block} />;
    case "multilingual":
      return <MultilingualSupport block={block} />;
    case "ivr":
      return <IVRSimulator block={block} />;
    case "voice_script":
      return <VoiceScript block={block} />;
    case "tts":
      return <TTSOutput block={block} />;
    case "sms_preview":
      return <SMSPreview block={block} />;
    case "vision_pipeline":
      return <VisionPipeline block={block} />;
    case "privacy_consent":
      return <PrivacyConsent block={block} />;
    case "stt":
      // STT (speech-to-text) blocks don't use the TTSOutput component.
      // Return null for now to avoid type mismatches; add a dedicated
      // STT renderer component here when available.
      return null;
    default: {
      // Exhaustiveness check: a new block type without a case is a compile error.
      const _exhaustiveCheck: never = block;
      return _exhaustiveCheck;
    }
  }
}