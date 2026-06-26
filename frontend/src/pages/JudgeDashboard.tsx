import { useState } from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  Shield, 
  Database, 
  MessageSquare,
  Phone,
  Sun,
  Moon,
  Brain,
  Sparkles
} from "lucide-react";

// Import all GenUI components
import { AIPipeline } from "../components/genui/AIPipeline";
import { HallucinationGuardrail } from "../components/genui/HallucinationGuardrail";
import { USSDSimulator } from "../components/genui/USSDSimulator";
import { IVRSimulator } from "../components/genui/IVRSimulator";
import { VoiceScript } from "../components/genui/VoiceScript";
import { TTSOutput } from "../components/genui/TTSOutput";
import { SMSPreview } from "../components/genui/SMSPreview";
import { MultilingualSupport } from "../components/genui/MultilingualSupport";
import { VisionPipeline } from "../components/genui/VisionPipeline";
import { PrivacyConsent } from "../components/genui/PrivacyConsent";
import { SMSInbox } from "../components/genui/SMSInbox";
import { USSDFlowChart } from "../components/genui/USSDFlowChart";

// ==================== COMPLETE MOCK DATA ====================

const mockBlocks: any[] = [
  // 1. AI Pipeline
  {
    type: "ai_pipeline",
    steps: {
      intent: { status: "complete", value: "Kano Maize Pre-planting" },
      neo4j: { status: "complete", value: "5 nodes found" },
      grounding: { status: "complete", value: "Passed" },
      featherless: { status: "complete", value: "Advisory generated" },
      advisory: { status: "complete", value: "Delivered" },
    },
    status: "complete",
    latency: 320,
  },

  // 2. USSD Simulator
  {
    type: "ussd_simulator",
    currentStep: 0,
    totalSteps: 5,
    language: "Hausa",
    crop: "Maize",
    region: "Kano",
    stage: "Pre-planting",
    advisory: "Ruwan sama zai makara a Kano. Jira makonni 2 kafin dasa. Yi amfani da SAMMAZ 15.",
    sms: "AGRION: Kano Maize 2026. Delay planting 2 weeks. Use SAMMAZ 15.",
    action: "Ajiye ₦2,000 akan CashCard",
  },

  // 3. Hallucination Guardrail
  {
    type: "guardrail",
    inScope: {
      query: "When to plant maize in Kano?",
      response: "Jira makonni 2 kafin dasa. Rains will be late this season.",
    },
    outOfScope: {
      query: "Tomato prices in Lagos market?",
      response: "I don't have that information. Please ask about crop planting, weather, or farming advice.",
    },
  },

  // 4. IVR Simulator
  {
    type: "ivr",
    currentPrompt: {
      id: "welcome",
      language: "Hausa",
      text: "Barka da zuwa AgriConnect. Zaɓi yarenka.",
      translation: "Welcome to AgriConnect. Select your language.",
      options: [
        { key: "1", label: "Hausa" },
        { key: "2", label: "Yoruba" },
        { key: "3", label: "Igbo" },
        { key: "4", label: "English" },
      ],
    },
    step: 1,
    totalSteps: 5,
    isActive: true,
    callStatus: "active",
  },

  // 5. Voice Script
  {
    type: "voice_script",
    scripts: [
      { id: "welcome", language: "Hausa", text: "Barka da zuwa AgriConnect", translation: "Welcome to AgriConnect", type: "welcome" },
      { id: "language", language: "Hausa", text: "Zaɓi yarenka", translation: "Select your language", type: "language" },
      { id: "crop", language: "Hausa", text: "Zaɓi amfanin gona", translation: "Select your crop", type: "crop" },
      { id: "region", language: "Hausa", text: "Zaɓi jihar ka", translation: "Select your state", type: "region" },
      { id: "stage", language: "Hausa", text: "Menene marhalar noma ka?", translation: "What is your farm stage?", type: "stage" },
      { id: "advisory", language: "Hausa", text: "Ruwan sama zai makara a Kano", translation: "Rains will be late in Kano", type: "advisory" },
      { id: "goodbye", language: "Hausa", text: "Na gode da amfani da AgriConnect", translation: "Thank you for using AgriConnect", type: "goodbye" },
    ],
    selectedLanguage: "Hausa",
  },

  // 6. TTS Output
  {
    type: "tts",
    text: "Ruwan sama zai makara a Kano wannan shekarar. Jira makonni 2 kafin dasa.",
    language: "Hausa",
    isPlaying: false,
    duration: 4,
  },

  // 7. SMS Preview
  {
    type: "sms_preview",
    selectedLanguage: "en",
    selectedTemplate: "advisory",
    templates: [
      { id: "advisory", label: "Advisory", icon: "📬" },
      { id: "finance", label: "Finance Nudge", icon: "💰" },
      { id: "image", label: "Image Upload", icon: "📷" },
      { id: "confirmation", label: "Confirmation", icon: "✅" },
    ],
    languages: [
      { code: "en", name: "English", flag: "GB" },
      { code: "ha", name: "Hausa", flag: "NG" },
      { code: "yo", name: "Yoruba", flag: "NG" },
      { code: "ig", name: "Igbo", flag: "NG" },
    ],
    content: {
      advisory: {
        en: "AGRION: Kano Maize 2026. Rains will be late. Wait 2 weeks before planting. Use SAMMAZ 15. Save ₦2,000 before buying fertilizer.",
        ha: "AGRION: Kano Masara 2026. Ruwan sama zai makara. Jira makonni 2 kafin dasa. Yi amfani da SAMMAZ 15. Ajiye ₦2,000 kafin sayo taki.",
        yo: "AGRION: Kano Agbado 2026. Ojo yoo pẹ. Duro ọsẹ 2 ṣaaju dida. Lo SAMMAZ 15. Fipamọ ₦2,000 ṣaaju ra ajile.",
        ig: "AGRION: Kano Ọka 2026. Mmiri ozuzo ga-egbu oge. Chere izu 2 tupu ịkụ. Jiri SAMMAZ 15. Chekwaa ₦2,000 tupu ịzụta fatiliza.",
      },
      finance: {
        en: "Reminder: You have 14 days to save ₦2,000 on your CashCard. Prepare before fertilizer buying season.",
        ha: "Tuna: Kana da kwanaki 14 don ajiye ₦2,000 akan CashCard. Ka shirya kafin lokacin sayo taki.",
        yo: "Iranti: O ni ọjọ 14 lati fipamọ ₦2,000 lori CashCard rẹ. Mura ṣaaju akoko ra ajile.",
        ig: "Ncheta: Ị nwere ụbọchị 14 ịchekwa ₦2,000 na CashCard gị. Kwadoo tupu oge ịzụta fatiliza.",
      },
      image: {
        en: "Send photo of your crop to 0800-AGRI-CONNECT. We will analyze and send advice within 24 hours.",
        ha: "Aika hoton amfanin gonarka zuwa 0800-AGRI-CONNECT. Za mu bincika kuma mu aiko da nasiha cikin awa 24.",
        yo: "Firanse fọto irugbin rẹ si 0800-AGRI-CONNECT. A yoo ṣe ayẹwo ati firanse imọran laarin wakati 24.",
        ig: "Ziga foto ihe ọkụkụ gị na 0800-AGRI-CONNECT. Anyị ga-enyocha ma ziga ndụmọdụ n'ime awa 24.",
      },
      confirmation: {
        en: "Advisory sent. To listen again, call *384#. Thank you for using AgriConnect.",
        ha: "Nasiha an aika. Domin sake saurara, kira *384#. Na gode da amfani da AgriConnect.",
        yo: "Imọran ti firanse. Lati tun gbọ, pe *384#. O ṣeun fun lilo AgriConnect.",
        ig: "Ndụmọdụ ezitere. Iji gee ntị ọzọ, kpọọ *384#. Daalụ maka iji AgriConnect.",
      },
    },
  },

  // 8. Vision Pipeline
  {
    type: "vision_pipeline",
  },

  // 9. Privacy and Consent
  {
    type: "privacy_consent",
  },

  // 10. SMS Inbox
  {
    type: "sms_inbox",
  },

  // 11. USSD Flow Chart
  {
    type: "ussd_flow_chart",
  },

  // 12. Multilingual Support
  {
    type: "multilingual",
    languages: [
      { code: "ha", name: "Hausa", flag: "NG", example: "Lokacin shuka", welcome: "Barka da zuwa AgriConnect" },
      { code: "yo", name: "Yoruba", flag: "NG", example: "Akoko dida", welcome: "Kaabọ si AgriConnect" },
      { code: "ig", name: "Igbo", flag: "NG", example: "Oge ịkụ", welcome: "Nnọọ na AgriConnect" },
      { code: "en", name: "English", flag: "GB", example: "Planting time", welcome: "Welcome to AgriConnect" },
    ],
    selectedLanguage: "ha",
  },
];

// ==================== JUDGE DASHBOARD ====================

export function JudgeDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const tabs = [
    { id: "all", label: "All Components", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "ai", label: "AI Pipeline", icon: <Cpu className="w-4 h-4" /> },
    { id: "voice", label: "Voice & IVR", icon: <Phone className="w-4 h-4" /> },
    { id: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  ];

  const getFilteredBlocks = () => {
    if (activeTab === "all") return mockBlocks;
    if (activeTab === "ai") {
      return mockBlocks.filter((b: any) => 
        b.type === "ai_pipeline" || 
        b.type === "guardrail" ||
        b.type === "vision_pipeline"
      );
    }
    if (activeTab === "voice") {
      return mockBlocks.filter((b: any) => 
        b.type === "ivr" || 
        b.type === "voice_script" || 
        b.type === "tts"
      );
    }
    if (activeTab === "sms") {
      return mockBlocks.filter((b: any) => 
        b.type === "sms_preview" || 
        b.type === "sms_inbox"
      );
    }
    if (activeTab === "security") {
      return mockBlocks.filter((b: any) => 
        b.type === "guardrail" || 
        b.type === "privacy_consent"
      );
    }
    return mockBlocks;
  };

  const filteredBlocks = getFilteredBlocks();

  // Render component based on type
  const renderComponent = (block: any) => {
    switch (block.type) {
      case "ai_pipeline":
        return <AIPipeline block={block} />;
      case "guardrail":
        return <HallucinationGuardrail block={block} />;
      case "ussd_simulator":
        return <USSDSimulator block={block} />;
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
      case "sms_inbox":
        return <SMSInbox block={block} />;
      case "ussd_flow_chart":
        return <USSDFlowChart block={block} />;
      case "multilingual":
        return <MultilingualSupport block={block} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-7 h-7 text-marigold" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Judge Dashboard</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                AI Behind the Scenes
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          </header>

          {/* Welcome */}
          <div className="bg-gradient-to-r from-marigold/10 to-marigold/5 dark:from-marigold/20 dark:to-transparent rounded-xl p-8 mb-10 border border-marigold/20 dark:border-marigold/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Brain className="w-7 h-7 text-marigold" />
              How AgriConnect Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">
              See the AI pipeline, voice system, SMS delivery, and security measures — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="text-xs bg-marigold/20 text-marigold px-4 py-1.5 rounded-full flex items-center gap-2">
                <Cpu className="w-3 h-3" /> GraphRAG
              </span>
              <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Shield className="w-3 h-3" /> Guardrail
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Database className="w-3 h-3" /> Neo4j
              </span>
              <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Featherless AI
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === tab.id
                    ? 'bg-marigold text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Components Grid - More spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredBlocks.map((block: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {renderComponent(block)}
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 pt-8 pb-6 mt-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief · Sandy Serenity Palette
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}