import { GenUIRenderer } from "./components/genui";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";

// ==================== COMPLETE MOCK DATA ====================

const mockBlocks = [
  // 1. AI Pipeline
  {
    type: "ai_pipeline" as const,
    steps: {
      intent: { status: "complete" as const, value: "Kano Maize Pre-planting" },
      neo4j: { status: "complete" as const, value: "5 nodes found" },
      grounding: { status: "complete" as const, value: "✅ Passed" },
      featherless: { status: "complete" as const, value: "Advisory generated" },
      advisory: { status: "complete" as const, value: "✅ Delivered" },
    },
    status: "complete" as const,
    latency: 320,
  },

  // 2. USSD Simulator
  {
    type: "ussd_simulator" as const,
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

  // 3. AI Chat
  {
    type: "ai_chat" as const,
    messages: [
      { role: "user" as const, content: "What crop should I plant in Kano?" },
      { role: "assistant" as const, content: "Based on NiMet data, maize is recommended for Kano this season. Rains will be late, so wait 2 weeks before planting." },
    ],
    suggestions: ["🌽 Planting time", "🌧️ Weather forecast", "💰 Finance nudge", "🌾 Crop variety"],
  },

  // 4. Hallucination Guardrail
  {
    type: "guardrail" as const,
    inScope: {
      query: "When to plant maize in Kano?",
      response: "Jira makonni 2 kafin dasa. Rains will be late this season.",
    },
    outOfScope: {
      query: "Tomato prices in Lagos market?",
      response: "I don't have that information. Please ask about crop planting, weather, or farming advice.",
    },
  },

  // 5. Multilingual Support
  {
    type: "multilingual" as const,
    languages: [
      { code: "ha", name: "Hausa", flag: "🇳🇬", example: "Lokacin shuka", welcome: "Barka da zuwa AgriConnect" },
      { code: "yo", name: "Yoruba", flag: "🇳🇬", example: "Akoko dida", welcome: "Kaabọ si AgriConnect" },
      { code: "ig", name: "Igbo", flag: "🇳🇬", example: "Oge ịkụ", welcome: "Nnọọ na AgriConnect" },
      { code: "en", name: "English", flag: "🇬🇧", example: "Planting time", welcome: "Welcome to AgriConnect" },
    ],
    selectedLanguage: "ha",
  },

  // 6. IVR Simulator
  {
    type: "ivr" as const,
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
    callStatus: "active" as const,
  },

  // 7. Voice Script
  {
    type: "voice_script" as const,
    scripts: [
      { id: "welcome", language: "Hausa", text: "Barka da zuwa AgriConnect", translation: "Welcome to AgriConnect", type: "welcome" as const },
      { id: "language", language: "Hausa", text: "Zaɓi yarenka", translation: "Select your language", type: "language" as const },
      { id: "crop", language: "Hausa", text: "Zaɓi amfanin gona", translation: "Select your crop", type: "crop" as const },
      { id: "region", language: "Hausa", text: "Zaɓi jihar ka", translation: "Select your state", type: "region" as const },
      { id: "stage", language: "Hausa", text: "Menene marhalar noma ka?", translation: "What is your farm stage?", type: "stage" as const },
      { id: "advisory", language: "Hausa", text: "Ruwan sama zai makara a Kano", translation: "Rains will be late in Kano", type: "advisory" as const },
      { id: "goodbye", language: "Hausa", text: "Na gode da amfani da AgriConnect", translation: "Thank you for using AgriConnect", type: "goodbye" as const },
    ],
    selectedLanguage: "Hausa",
  },

  // 8. TTS Output
  {
    type: "tts" as const,
    text: "Ruwan sama zai makara a Kano wannan shekarar. Jira makonni 2 kafin dasa.",
    language: "Hausa",
    isPlaying: false,
    duration: 4,
  },

  // 9. SMS Preview
  {
    type: "sms_preview" as const,
    selectedLanguage: "en",
    selectedTemplate: "advisory",
    templates: [
      { id: "advisory", label: "Advisory", icon: "🌾" },
      { id: "finance", label: "Finance Nudge", icon: "💰" },
      { id: "image", label: "Image Upload", icon: "📷" },
      { id: "confirmation", label: "Confirmation", icon: "✅" },
    ],
    languages: [
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "ha", name: "Hausa", flag: "🇳🇬" },
      { code: "yo", name: "Yoruba", flag: "🇳🇬" },
      { code: "ig", name: "Igbo", flag: "🇳🇬" },
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

  // 10. Vision Pipeline
  {
    type: "vision_pipeline" as const,
  },
];

// ==================== APP ====================

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <main className="min-h-screen bg-cream dark:bg-dark-bg p-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center border-b border-sand dark:border-dark-border pb-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-thunder dark:text-dark-text flex items-center gap-2">
                <span className="text-marigold dark:text-dark-accent">🌾</span> 
                AgriConnect <span className="text-copper dark:text-dark-text3">Nigeria</span>
              </h1>
              <p className="text-sm text-dallas dark:text-dark-text2">
                Advisory dashboard — generative UI from the farming knowledge graph.
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-sand dark:border-dark-border bg-white dark:bg-dark-surface text-thunder dark:text-dark-text hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>

          {/* Render all mock blocks */}
          <div className="space-y-4">
            {mockBlocks.map((block, i) => (
              <GenUIRenderer key={i} block={block} />
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-sand dark:border-dark-border text-center text-copper dark:text-dark-text3 text-sm">
            Sandy Serenity Palette · Kenya AI Challenge 2026 · Crop2Cash Brief
          </footer>
        </div>
      </main>
    </div>
  );
}