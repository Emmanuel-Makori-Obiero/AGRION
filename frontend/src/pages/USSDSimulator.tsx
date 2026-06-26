import { useState } from "react";
import { 
  Phone, 
  Globe, 
  Sprout, 
  MapPin, 
  CalendarDays,
  CheckCircle,
  ArrowLeft,
  Send,
  X,
  MessageSquare,
  AlertCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Mic,
  Volume2,
  PhoneCall,
  PhoneOff,
  Loader2,
  ScrollText,
  Play,
  Pause
} from "lucide-react";

// ==================== LANGUAGE TRANSLATIONS ====================

const translations = {
  en: {
    language: "English",
    crop: "Maize",
    region: "Kano",
    stage: "Pre-planting",
    advisory: "Rains will be late in Kano this year. Wait 2 weeks before planting. Use SAMMAZ 15 which is drought-tolerant.",
    sms: "AGRION: Kano Maize 2026. Delay planting 2 weeks. Use SAMMAZ 15.",
    action: "Save ₦2,000 on your CashCard before buying fertilizer",
    stepTitles: ["Select your language", "Select your crop", "Select your state", "What is your farm stage?"],
    stepSubtitles: ["", "", "", ""],
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
    crops: ["Maize", "Rice", "Cassava", "Soya"],
    regions: ["Kano", "Kaduna", "Kebbi", "Lagos", "Oyo", "Enugu"],
    stages: ["Pre-planting", "Planting", "Growing", "Harvest"],
    voicePrompt: "Welcome to AgriConnect. Select your language. Press 1 for English, 2 for Hausa, 3 for Yoruba, 4 for Igbo, 5 for Pidgin.",
    voiceScripts: [
      { id: "welcome", text: "Welcome to AgriConnect", type: "Welcome" },
      { id: "language", text: "Select your language", type: "Language" },
      { id: "crop", text: "Select your crop", type: "Crop" },
      { id: "region", text: "Select your state", type: "Region" },
      { id: "stage", text: "What is your farm stage?", type: "Stage" },
      { id: "advisory", text: "Rains will be late in Kano this year. Wait 2 weeks before planting.", type: "Advisory" },
      { id: "goodbye", text: "Thank you for using AgriConnect", type: "Goodbye" },
    ],
    ttsText: "Rains will be late in Kano this year. Wait 2 weeks before planting.",
  },
  ha: {
    language: "Hausa",
    crop: "Masara",
    region: "Kano",
    stage: "Kafin shuka",
    advisory: "Ruwan sama zai makara a Kano wannan shekarar. Jira makonni 2 kafin dasa. Yi amfani da SAMMAZ 15 wanda yake jurewa fari.",
    sms: "AGRION: Kano Masara 2026. Jira makonni 2 kafin dasa. Yi amfani da SAMMAZ 15.",
    action: "Ajiye ₦2,000 akan CashCard kafin sayo taki",
    stepTitles: ["Zaɓi yarenka", "Zaɓi amfanin gona", "Zaɓi jihar ka", "Menene marhalar noma ka?"],
    stepSubtitles: ["", "(Select your crop)", "(Select your state)", "(What is your farm stage?)"],
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
    crops: ["Masara", "Shinkafa", "Rogo", "Soya"],
    regions: ["Kano", "Kaduna", "Kebbi", "Legas", "Oyo", "Enugu"],
    stages: ["Kafin shuka", "Shuka", "Girma", "Girbi"],
    voicePrompt: "Barka da zuwa AgriConnect. Zaɓi yarenka. Latsa 1 don English, 2 don Hausa, 3 don Yoruba, 4 don Igbo, 5 don Pidgin.",
    voiceScripts: [
      { id: "welcome", text: "Barka da zuwa AgriConnect", type: "Welcome" },
      { id: "language", text: "Zaɓi yarenka", type: "Language" },
      { id: "crop", text: "Zaɓi amfanin gona", type: "Crop" },
      { id: "region", text: "Zaɓi jihar ka", type: "Region" },
      { id: "stage", text: "Menene marhalar noma ka?", type: "Stage" },
      { id: "advisory", text: "Ruwan sama zai makara a Kano wannan shekarar. Jira makonni 2 kafin dasa.", type: "Advisory" },
      { id: "goodbye", text: "Na gode da amfani da AgriConnect", type: "Goodbye" },
    ],
    ttsText: "Ruwan sama zai makara a Kano wannan shekarar. Jira makonni 2 kafin dasa.",
  },
  yo: {
    language: "Yoruba",
    crop: "Agbado",
    region: "Kano",
    stage: "Ṣaaju dida",
    advisory: "Ojo yoo pẹ ni Kano ni ọdun yii. Duro ọsẹ 2 ṣaaju dida. Lo SAMMAZ 15 ti o ko ogbele.",
    sms: "AGRION: Kano Agbado 2026. Duro ọsẹ 2 ṣaaju dida. Lo SAMMAZ 15.",
    action: "Fipamọ ₦2,000 lori CashCard rẹ ṣaaju ra ajile",
    stepTitles: ["Yan ede rẹ", "Yan irugbin rẹ", "Yan ipinle rẹ", "Ipele ogbin rẹ?"],
    stepSubtitles: ["", "(Yan irugbin rẹ)", "(Yan ipinle rẹ)", "(Ipele ogbin rẹ?)"],
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
    crops: ["Agbado", "Iresi", "Ege", "Soya"],
    regions: ["Kano", "Kaduna", "Kebbi", "Eko", "Oyo", "Enugu"],
    stages: ["Ṣaaju dida", "Dida", "Dagba", "Ikore"],
    voicePrompt: "Kaabọ si AgriConnect. Yan ede rẹ. Tẹ 1 fun English, 2 fun Hausa, 3 fun Yoruba, 4 fun Igbo, 5 fun Pidgin.",
    voiceScripts: [
      { id: "welcome", text: "Kaabọ si AgriConnect", type: "Welcome" },
      { id: "language", text: "Yan ede rẹ", type: "Language" },
      { id: "crop", text: "Yan irugbin rẹ", type: "Crop" },
      { id: "region", text: "Yan ipinle rẹ", type: "Region" },
      { id: "stage", text: "Ipele ogbin rẹ?", type: "Stage" },
      { id: "advisory", text: "Ojo yoo pẹ ni Kano ni ọdun yii. Duro ọsẹ 2 ṣaaju dida.", type: "Advisory" },
      { id: "goodbye", text: "O ṣeun fun lilo AgriConnect", type: "Goodbye" },
    ],
    ttsText: "Ojo yoo pẹ ni Kano ni ọdun yii. Duro ọsẹ 2 ṣaaju dida.",
  },
  ig: {
    language: "Igbo",
    crop: "Ọka",
    region: "Kano",
    stage: "Tupu ịkụ",
    advisory: "Mmiri ozuzo ga-egbu oge na Kano n'afọ a. Chere izu 2 tupu ịkụ. Jiri SAMMAZ 15 nke na-eguzogide ọkọchị.",
    sms: "AGRION: Kano Ọka 2026. Chere izu 2 tupu ịkụ. Jiri SAMMAZ 15.",
    action: "Chekwaa ₦2,000 na CashCard gị tupu ịzụta fatiliza",
    stepTitles: ["Họrọ asụsụ gị", "Họrọ ihe ọkụkụ gị", "Họrọ steeti gị", "Oge ọrụ ugbo gị?"],
    stepSubtitles: ["", "(Họrọ ihe ọkụkụ gị)", "(Họrọ steeti gị)", "(Oge ọrụ ugbo gị?)"],
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
    crops: ["Ọka", "Osikapa", "Akpu", "Soya"],
    regions: ["Kano", "Kaduna", "Kebbi", "Lagos", "Oyo", "Enugu"],
    stages: ["Tupu ịkụ", "Ịkụ", "Ito", "Owuwe"],
    voicePrompt: "Nnọọ na AgriConnect. Họrọ asụsụ gị. Pịa 1 maka English, 2 maka Hausa, 3 maka Yoruba, 4 maka Igbo, 5 maka Pidgin.",
    voiceScripts: [
      { id: "welcome", text: "Nnọọ na AgriConnect", type: "Welcome" },
      { id: "language", text: "Họrọ asụsụ gị", type: "Language" },
      { id: "crop", text: "Họrọ ihe ọkụkụ gị", type: "Crop" },
      { id: "region", text: "Họrọ steeti gị", type: "Region" },
      { id: "stage", text: "Oge ọrụ ugbo gị?", type: "Stage" },
      { id: "advisory", text: "Mmiri ozuzo ga-egbu oge na Kano n'afọ a. Chere izu 2 tupu ịkụ.", type: "Advisory" },
      { id: "goodbye", text: "Daalụ maka iji AgriConnect", type: "Goodbye" },
    ],
    ttsText: "Mmiri ozuzo ga-egbu oge na Kano n'afọ a. Chere izu 2 tupu ịkụ.",
  },
  pcm: {
    language: "Pidgin",
    crop: "Maize",
    region: "Kano",
    stage: "Before planting",
    advisory: "Rain go late for Kano this year. Wait 2 weeks before planting. Use SAMMAZ 15 wey fit survive dry weather.",
    sms: "AGRION: Kano Maize 2026. Wait 2 weeks before planting. Use SAMMAZ 15.",
    action: "Save ₦2,000 for your CashCard before you buy fertilizer",
    stepTitles: ["Choose your language", "Choose your crop", "Choose your state", "Wetin be your farm stage?"],
    stepSubtitles: ["", "(Choose your crop)", "(Choose your state)", "(Wetin be your farm stage?)"],
    languages: ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"],
    crops: ["Maize", "Rice", "Cassava", "Soya"],
    regions: ["Kano", "Kaduna", "Kebbi", "Lagos", "Oyo", "Enugu"],
    stages: ["Before planting", "Planting", "Growing", "Harvest"],
    voicePrompt: "Welcome to AgriConnect. Choose your language. Press 1 for English, 2 for Hausa, 3 for Yoruba, 4 for Igbo, 5 for Pidgin.",
    voiceScripts: [
      { id: "welcome", text: "Welcome to AgriConnect", type: "Welcome" },
      { id: "language", text: "Choose your language", type: "Language" },
      { id: "crop", text: "Choose your crop", type: "Crop" },
      { id: "region", text: "Choose your state", type: "Region" },
      { id: "stage", text: "Wetin be your farm stage?", type: "Stage" },
      { id: "advisory", text: "Rain go late for Kano this year. Wait 2 weeks before planting.", type: "Advisory" },
      { id: "goodbye", text: "Thank you for using AgriConnect", type: "Goodbye" },
    ],
    ttsText: "Rain go late for Kano this year. Wait 2 weeks before planting.",
  },
};

// SMS Inbox Mock Data
const smsMessages = {
  en: [
    { 
      id: 1, 
      sender: "You", 
      content: "How much will 2 bags cost at the market?", 
      time: "1d ago",
      fullContent: "How much will 2 bags of fertilizer cost at the market this season? I need to plan my budget."
    },
    { 
      id: 2, 
      sender: "Agrion Advisory", 
      content: "Fertilizer prices vary by region. Check with your local agro-dealer.", 
      time: "23h ago",
      fullContent: "Fertilizer prices vary by region. Check local agro-dealers. Typical cost: 5000-7000 Naira per bag."
    },
    { 
      id: 3, 
      sender: "Agrion Advisory", 
      content: "Pest Alert: Armyworms detected in your region. Check your fields.", 
      time: "13h ago",
      fullContent: "Pest Alert: Armyworms detected in your region. Inspect maize plants for damage. Use neem oil spray."
    },
  ],
  ha: [
    { 
      id: 1, 
      sender: "Kai", 
      content: "Nawa ne jakunkuna 2 za su kashe a kasuwa?", 
      time: "1d ago",
      fullContent: "Nawa ne jakunkuna 2 na taki za su kashe a kasuwa wannan kakar? Ina buƙatar tsara kasafin kuɗi na."
    },
    { 
      id: 2, 
      sender: "Shawara Agrion", 
      content: "Farashin taki ya bambanta da yanki. Tuntuɓi dillalin ku.", 
      time: "23h ago",
      fullContent: "Farashin taki ya bambanta da yanki. Tuntuɓi dillalin ku. Farashi: 5000-7000 Naira."
    },
    { 
      id: 3, 
      sender: "Shawara Agrion", 
      content: "Gargaɗi: An gano tsutsa a yankinku. Bincika gonarku.", 
      time: "13h ago",
      fullContent: "Gargaɗi: An gano tsutsa a yankinku. Bincika gonarku. Yi amfani da maganin neem."
    },
  ],
  yo: [
    { 
      id: 1, 
      sender: "Ìwọ", 
      content: "Elélo ni apo 2 yóò jẹ ní ọjà?", 
      time: "1d ago",
      fullContent: "Elélo ni apo 2 ti ajile yóò jẹ ní ọjà? Mo nilati ṣe ètò isuna mi."
    },
    { 
      id: 2, 
      sender: "Imọran Agrion", 
      content: "Awọn owo ajile yatọ ni agbegbe. Kan si alagbata rẹ.", 
      time: "23h ago",
      fullContent: "Awọn owo ajile yatọ ni agbegbe. Kan si alagbata rẹ. Owo: 5000-7000 Naira."
    },
  ],
  ig: [
    { 
      id: 1, 
      sender: "Ị", 
      content: "Ego ole ka akpa 2 ga-eri n'ahịa?", 
      time: "1d ago",
      fullContent: "Ego ole ka akpa 2 fatiliza ga-eri n'ahịa n'oge a? Achọrọ m ịhazi ego m."
    },
    { 
      id: 2, 
      sender: "Ndụmọdụ Agrion", 
      content: "Ọnụahịa fatiliza dị iche na mpaghara. Jụọ onye na-ere ihe.", 
      time: "23h ago",
      fullContent: "Ọnụahịa fatiliza dị iche na mpaghara. Jụọ onye na-ere ihe gị. Ọnụ: 5000-7000 Naira."
    },
  ],
  pcm: [
    { 
      id: 1, 
      sender: "You", 
      content: "How much 2 bag go cost for market?", 
      time: "1d ago",
      fullContent: "How much 2 bag of fertilizer go cost for market this season? I need plan my money."
    },
    { 
      id: 2, 
      sender: "Agrion Advisory", 
      content: "Fertilizer price dey different for different area. Ask your local dealer.", 
      time: "23h ago",
      fullContent: "Fertilizer price dey different for different area. Ask your local dealer. Price: 5000-7000 Naira."
    },
  ],
};

export function USSDSimulatorPage() {
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState("ha");
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [selectedRegion, setSelectedRegion] = useState("kano");
  const [selectedStage, setSelectedStage] = useState("pre");
  const [isComplete, setIsComplete] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState<number | null>(null);
  
  // Voice/IVR states
  const [isRinging, setIsRinging] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [playingScript, setPlayingScript] = useState<string | null>(null);
  const [ttsPlaying, setTtsPlaying] = useState(false);

  const langData = translations[selectedLang as keyof typeof translations] || translations.en;
  const messages = smsMessages[selectedLang as keyof typeof smsMessages] || smsMessages.en;

  const langOptions = [
    { code: "en", label: langData.languages[0] },
    { code: "ha", label: langData.languages[1] },
    { code: "yo", label: langData.languages[2] },
    { code: "ig", label: langData.languages[3] },
    { code: "pcm", label: langData.languages[4] },
  ];

  const cropOptions = [
    { id: "maize", label: langData.crops[0] },
    { id: "rice", label: langData.crops[1] },
    { id: "cassava", label: langData.crops[2] },
    { id: "soya", label: langData.crops[3] },
  ];

  const regionOptions = [
    { id: "kano", label: langData.regions[0] },
    { id: "kaduna", label: langData.regions[1] },
    { id: "kebbi", label: langData.regions[2] },
    { id: "lagos", label: langData.regions[3] },
    { id: "oyo", label: langData.regions[4] },
    { id: "enugu", label: langData.regions[5] },
  ];

  const stageOptions = [
    { id: "pre", label: langData.stages[0] },
    { id: "planting", label: langData.stages[1] },
    { id: "growing", label: langData.stages[2] },
    { id: "harvest", label: langData.stages[3] },
  ];

  const steps = [
    { label: "Language", icon: <Globe className="w-4 h-4" /> },
    { label: "Crop", icon: <Sprout className="w-4 h-4" /> },
    { label: "Region", icon: <MapPin className="w-4 h-4" /> },
    { label: "Stage", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Advisory", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setIsComplete(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setIsComplete(false);
    setSelectedLang("ha");
    setSelectedCrop("maize");
    setSelectedRegion("kano");
    setSelectedStage("pre");
  };

  const toggleMessage = (id: number) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  // Voice/IVR functions
  const toggleCall = () => {
    if (!callActive) {
      setIsRinging(true);
      setTimeout(() => {
        setIsRinging(false);
        setCallActive(true);
      }, 2000);
    } else {
      setCallActive(false);
      setIsRinging(false);
    }
  };

  const toggleScriptPlay = (id: string) => {
    setPlayingScript(playingScript === id ? null : id);
  };

  const toggleTtsPlay = () => {
    setTtsPlaying(!ttsPlaying);
  };

  const getStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="text-marigold text-sm font-medium">
              {langData.stepTitles[0]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {langOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setSelectedLang(opt.code);
                    setTimeout(handleNext, 400);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedLang === opt.code
                      ? 'border-marigold bg-marigold/20'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-medium">{opt.label}</span>
                    {selectedLang === opt.code && (
                      <CheckCircle className="w-4 h-4 text-marigold ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <div className="text-marigold text-sm font-medium">
              {langData.stepTitles[1]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cropOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedCrop(opt.id);
                    setTimeout(handleNext, 400);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedCrop === opt.id
                      ? 'border-marigold bg-marigold/20'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-marigold" />
                    <span className="text-gray-200 font-medium">{opt.label}</span>
                    {selectedCrop === opt.id && (
                      <CheckCircle className="w-4 h-4 text-marigold ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400">0. Koma (Back)</div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <div className="text-marigold text-sm font-medium">
              {langData.stepTitles[2]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {regionOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedRegion(opt.id);
                    setTimeout(handleNext, 400);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedRegion === opt.id
                      ? 'border-marigold bg-marigold/20'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-marigold" />
                    <span className="text-gray-200 font-medium">{opt.label}</span>
                    {selectedRegion === opt.id && (
                      <CheckCircle className="w-4 h-4 text-marigold ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400">0. Koma (Back)</div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <div className="text-marigold text-sm font-medium">
              {langData.stepTitles[3]}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stageOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedStage(opt.id);
                    setTimeout(handleNext, 400);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedStage === opt.id
                      ? 'border-marigold bg-marigold/20'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-marigold" />
                    <span className="text-gray-200 font-medium">{opt.label}</span>
                    {selectedStage === opt.id && (
                      <CheckCircle className="w-4 h-4 text-marigold ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400">0. Koma (Back)</div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <div className="text-marigold text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-marigold" />
              NASIHA / ADVISORY
            </div>
            <div className="bg-marigold/10 border border-marigold/30 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-400">{langData.region} · {langData.crop} · 2026</div>
              <p className="text-sm leading-relaxed text-gray-200">
                {langData.advisory}
              </p>
              <div className="bg-marigold/20 border border-marigold/40 rounded p-2">
                <p className="text-xs text-marigold flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-gray-200">{langData.action}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                SMS an aika ✓
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="w-full py-2 text-xs text-gray-400 hover:text-white border border-gray-600 rounded-lg transition-colors"
            >
              0. Ƙarshe (End Session)
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getStepInfo = () => {
    const labels = {
      en: ["Language", "Crop", "Region", "Stage", "Advisory"],
      ha: ["Yare", "Amfanin gona", "Jiha", "Marhalar noma", "Nasiha"],
      yo: ["Ede", "Irugbin", "Ipinle", "Ipele", "Imọran"],
      ig: ["Asụsụ", "Ihe ọkụkụ", "Steeti", "Oge", "Ndụmọdụ"],
      pcm: ["Language", "Crop", "Region", "Stage", "Advisory"],
    };
    const label = labels[selectedLang as keyof typeof labels] || labels.en;
    return { number: step + 1, total: 5, label: label[step] };
  };

  const stepInfo = getStepInfo();

  const unreadCount = messages.filter(m => 
    m.sender.includes("Agrion") || 
    m.sender.includes("Shawara") || 
    m.sender.includes("Imọran") || 
    m.sender.includes("Ndụmọdụ")
  ).length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Phone className="w-6 h-6 text-marigold dark:text-dark-accent" />
            <span>USSD Simulator</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            See what farmers experience on basic phones — no internet needed.
          </p>
        </div>

        {/* 3-Column Grid: USSD + SMS + Voice/IVR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Phone Mockup */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-marigold dark:text-dark-accent" />
              <span>USSD Flow</span>
            </h2>

            {/* Step Tracker */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Step {stepInfo.number} of {stepInfo.total} · {stepInfo.label}
                </span>
              </div>
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => index <= step && setStep(index)}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      index < step 
                        ? 'bg-marigold dark:bg-dark-accent' 
                        : index === step 
                          ? 'bg-marigold dark:bg-dark-accent animate-pulse' 
                          : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    disabled={index > step}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {steps.map((s, index) => (
                  <span key={index} className={`text-[8px] uppercase tracking-wider ${
                    index <= step ? 'text-marigold dark:text-dark-accent' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div className="bg-gray-900 dark:bg-gray-950 rounded-3xl p-4 shadow-xl max-w-sm mx-auto">
              <div className="bg-black rounded-xl p-5 min-h-[400px]">
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-4">
                  <span>*384#</span>
                  <span>Step {stepInfo.number} of {stepInfo.total}</span>
                </div>
                <div className="font-mono text-sm">
                  {getStepContent()}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleBack}
                  disabled={step === 0}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    step === 0
                      ? 'bg-gray-700 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={handleNext}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    step === steps.length - 1 && isComplete
                      ? 'bg-green-600/50 text-white/50 cursor-not-allowed'
                      : 'bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white'
                  }`}
                >
                  {step === steps.length - 1 && isComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      Send
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  title="End Session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Session Info */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-sm mx-auto">
              <span className="font-medium">Session:</span>
              <span>{langData.language} · {langData.crop} · {langData.region} · {langData.stage}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              <span className="text-green-500">● Active</span>
            </div>
          </div>

          {/* Column 2: SMS Inbox */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-marigold dark:text-dark-accent" />
              <span>SMS Inbox</span>
              <span className="text-xs bg-marigold/10 dark:bg-dark-accent/10 text-marigold dark:text-dark-accent px-2 py-0.5 rounded">
                {unreadCount} unread
              </span>
            </h2>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 max-h-[420px] overflow-y-auto">
              {messages.map((msg) => {
                const isAdvisory = msg.sender.includes("Agrion") || 
                  msg.sender.includes("Shawara") || 
                  msg.sender.includes("Imọran") || 
                  msg.sender.includes("Ndụmọdụ");
                const isExpanded = expandedMessage === msg.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                      isAdvisory ? 'border-l-2 border-marigold dark:border-dark-accent' : 'border-l-2 border-transparent'
                    } ${
                      isExpanded ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => toggleMessage(msg.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        isAdvisory ? 'text-marigold dark:text-dark-accent' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {isExpanded ? msg.fullContent || msg.content : msg.content}
                      {!isExpanded && msg.fullContent && msg.fullContent.length > msg.content.length && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">...</span>
                      )}
                    </p>
                    {msg.fullContent && msg.fullContent.length > msg.content.length && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Show less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Tap to read more</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
              <MessageSquare className="w-3 h-3 inline mr-1" />
              Messages are automatically delivered to farmers without data plans via SMS
            </div>
          </div>

          {/* Column 3: Voice/IVR + TTS */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mic className="w-4 h-4 text-marigold dark:text-dark-accent" />
              <span>Voice / IVR</span>
            </h2>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              
              {/* IVR Call Simulator */}
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-marigold/20 flex items-center justify-center">
                      {isRinging ? (
                        <Loader2 className="w-6 h-6 text-marigold animate-spin" />
                      ) : callActive ? (
                        <PhoneCall className="w-6 h-6 text-green-500" />
                      ) : (
                        <Phone className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isRinging ? "Connecting..." : callActive ? "Call Active" : "Tap to Call"}
                      </p>
                      <p className="text-xs text-gray-400">Toll-free IVR</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleCall}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      callActive 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-marigold hover:bg-marigold/80 text-white'
                    }`}
                  >
                    {callActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    {callActive ? 'End Call' : 'Call Now'}
                  </button>
                </div>
              </div>

              {/* Current Voice Prompt */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-marigold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Prompt</p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      "{langData.voicePrompt}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Hybrid Bridge Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <span className="w-2 h-2 bg-marigold rounded-full animate-pulse"></span>
                Hybrid USSD-IVR Bridge — Farmers can switch between text and voice
              </div>
            </div>

            {/* Voice Script */}
            <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <ScrollText className="w-4 h-4 text-marigold" />
                Voice Script
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {langData.voiceScripts.map((script) => (
                  <div key={script.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{script.type}</span>
                      <p className="text-sm text-gray-900 dark:text-white">{script.text}</p>
                    </div>
                    <button
                      onClick={() => toggleScriptPlay(script.id)}
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {playingScript === script.id ? (
                        <Pause className="w-4 h-4 text-marigold" />
                      ) : (
                        <Play className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TTS Output */}
            <div className="mt-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-marigold" />
                TTS Output
              </h3>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTtsPlay}
                    className="w-10 h-10 rounded-full bg-marigold flex items-center justify-center hover:bg-marigold/80 transition-colors"
                  >
                    {ttsPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full bg-marigold transition-all duration-300 ${ttsPlaying ? 'w-3/4' : 'w-0'}`} />
                      </div>
                      <span className="text-xs text-gray-400">
                        {ttsPlaying ? 'Playing...' : 'Ready'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 font-mono mt-2 leading-relaxed">
                      "{langData.ttsText}"
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                ElevenLabs TTS · Local dialect synthesis
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}