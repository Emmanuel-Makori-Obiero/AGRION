// Shared contract between the backend AI "blocks" and the React components
// that render them. Each block the backend streams has a `type` discriminator
// that maps 1:1 to a component in this folder.

export interface WeatherBlock {
  type: "weather";
  location: string;
  forecast: string;
  tempC: number;
  rainChance: number; // 0-100
}

export interface FinancialYieldPoint {
  label: string; // e.g. a month or season
  yield: number; // kg or tonnes
  revenue: number; // local currency
}

export interface FinancialYieldBlock {
  type: "financial_yield";
  crop: string;
  points: FinancialYieldPoint[];
}

export interface ActionAlertBlock {
  type: "action_alert";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
}

// ==================== AI BLOCK TYPES ====================

export interface AIPipelineStep {
  status: "idle" | "processing" | "complete";
  value: string;
}

export interface AIPipelineBlock {
  type: "ai_pipeline";
  steps: {
    intent: AIPipelineStep;
    neo4j: AIPipelineStep;
    grounding: AIPipelineStep;
    featherless: AIPipelineStep;
    advisory: AIPipelineStep;
  };
  status: "idle" | "processing" | "complete";
  latency: number;
}

export interface USSDSimulatorBlock {
  type: "ussd_simulator";
  currentStep: number;
  totalSteps: number;
  language: string;
  crop: string;
  region: string;
  stage: string;
  advisory: string;
  sms: string;
  action: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChatBlock {
  type: "ai_chat";
  messages: ChatMessage[];
  suggestions: string[];
}

export interface GuardrailExample {
  query: string;
  response: string;
}

export interface GuardrailBlock {
  type: "guardrail";
  inScope: GuardrailExample;
  outOfScope: GuardrailExample;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  example: string;
  welcome: string;
}

export interface MultilingualBlock {
  type: "multilingual";
  languages: Language[];
  selectedLanguage: string;
}

// ==================== VOICE / IVR BLOCK TYPES ====================

export interface IVRPrompt {
  id: string;
  language: string;
  text: string;
  translation?: string;
  options?: { key: string; label: string }[];
}

export interface IVRBlock {
  type: "ivr";
  currentPrompt: IVRPrompt;
  step: number;
  totalSteps: number;
  isActive: boolean;
  callStatus: "idle" | "connecting" | "active" | "ended";
}

export interface VoiceScriptBlock {
  type: "voice_script";
  scripts: {
    id: string;
    language: string;
    text: string;
    translation: string;
    type: "welcome" | "language" | "crop" | "region" | "stage" | "advisory" | "goodbye";
  }[];
  selectedLanguage: string;
}

export interface TTSBlock {
  type: "tts";
  text: string;
  language: string;
  isPlaying: boolean;
  duration: number; // seconds
}

export interface STTBlock {
  type: "stt";
  isListening: boolean;
  transcript: string;
  confidence: number;
  lastCommand: string;
}

// ==================== SMS PREVIEW BLOCK TYPES ====================

export interface SMSPreviewTemplate {
  id: string;
  label: string;
  icon: string;
}

export interface SMSLanguage {
  code: string;
  name: string;
  flag: string;
}

export interface SMSPreviewBlock {
  type: "sms_preview";
  selectedLanguage: string;
  selectedTemplate: string;
  templates: SMSPreviewTemplate[];
  languages: SMSLanguage[];
  content: Record<string, Record<string, string>>;
}

// ==================== VISION PIPELINE BLOCK TYPES ====================

export interface VisionPipelineBlock {
  type: "vision_pipeline";
}

// Update the GenUIBlock type to include all AI blocks
export type GenUIBlock = 
  | WeatherBlock 
  | FinancialYieldBlock 
  | ActionAlertBlock 
  | AIPipelineBlock 
  | USSDSimulatorBlock 
  | AIChatBlock 
  | GuardrailBlock 
  | MultilingualBlock
  | IVRBlock
  | VoiceScriptBlock
  | TTSBlock
  | STTBlock
  | SMSPreviewBlock
  | VisionPipelineBlock;  // ← ADDED
  