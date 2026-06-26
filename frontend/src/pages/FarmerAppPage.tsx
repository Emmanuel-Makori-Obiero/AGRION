import { useState } from "react";
import { 
  MessageCircle, 
  Camera, 
  Inbox, 
  Send, 
  Sparkles,
  Sprout,
  CloudRain,
  Bug,
  CreditCard,
  Upload,
  CheckCircle,
  Loader2,
  Shield,
  Sun,
  Moon,
  Phone,
  Globe,
} from "lucide-react";

// ==================== TRANSLATIONS ====================

const translations = {
  en: {
    appName: "AgriConnect",
    tagline: "Farm smarter, together",
    welcome: "Get instant farm advice — no account needed.",
    welcomeSub: "Ask questions, scan your crops, and read SMS advisories — all in your language.",
    chatTitle: "AI Chat Assistant",
    chatSub: "Ask anything about your farm",
    visionTitle: "Crop Photo Analysis",
    visionSub: "Upload a photo to detect disease & pests",
    smsTitle: "SMS Inbox",
    smsSub: "Two-way messages with Agrion Advisory",
    upload: "Drop photo here or click to upload",
    uploadSub: "JPG · PNG · HEIC",
    analyze: "Analyze photo",
    pipelineTitle: "Vision Pipeline · Live",
    pipelineDesc: "Upload any crop image and run it through Alfred's four-stage pipeline.",
    stage1: "Stage 1 — Backend capture (MMS received)",
    stage2: "Stage 2 — AI upscaling & denoising",
    stage3: "Stage 3 — Vision LLM analysis",
    stage4: "Stage 4 — Dispatching SMS via Africa's Talking",
    smsPreview: "SMS delivered to farmer",
    noAccount: "Don't have a smartphone? Dial *384# on any phone!",
    ndpa: "NDPA 2023 Compliant",
    ndpaSub: "Your data is protected · Privacy by design",
    quickReplies: ["Planting advice", "Weather forecast", "Pest control", "CashCard"],
    noInternet: "No internet needed on USSD · Available in 5 languages",
    team: "Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief",
    palette: "Sandy Serenity Palette",
    backToHome: "Back to home",
    farmerNotes: "Farmer notes (optional)",
    notesPlaceholder: "e.g. Maize, 6 weeks, yellowing on lower leaves",
    runPipeline: "Run pipeline",
    reset: "Reset",
    smsSent: "SMS sent",
    confidence: "Confidence",
    removeInfected: "Remove infected plants. Spray neem oil.",
    reply: "Reply",
    typeMessage: "Type your question...",
    replyToAgrion: "Reply to Agrion...",
    grounded: "Grounded in Neo4j data",
    aiThinking: "AgriConnect AI is thinking...",
    offline: "No internet needed on USSD",
  },
  ha: {
    appName: "AgriConnect",
    tagline: "Noma mafi kyau, tare",
    welcome: "Sami shawara nan take — ba buƙatar asusu.",
    welcomeSub: "Tambayi tambayoyi, bincika amfanin gonarka, kuma karanta saƙonnin SMS — duk cikin yarenka.",
    chatTitle: "Mai Taimakon Chat",
    chatSub: "Tambayi komai game da gonar ka",
    visionTitle: "Binciken Hoto na Amfanin Gona",
    visionSub: "Ɗauki hoto don gano cututtuka & kwari",
    smsTitle: "Akwatin Saƙon SMS",
    smsSub: "Saƙonnin biyu tare da Shawara Agrion",
    upload: "Sauke hoto anan ko danna don ɗaukaka",
    uploadSub: "JPG · PNG · HEIC",
    analyze: "Bincika hoto",
    pipelineTitle: "Vision Pipeline · Live",
    pipelineDesc: "Ɗauki hoton amfanin gonarka ka gudanar da shi ta matakai huɗu na Alfred.",
    stage1: "Mataki 1 — Karba (MMS received)",
    stage2: "Mataki 2 — AI upscaling & denoising",
    stage3: "Mataki 3 — Vision LLM analysis",
    stage4: "Mataki 4 — Aika SMS ta Africa's Talking",
    smsPreview: "SMS da aka aika ga manomi",
    noAccount: "Ba ka da smartphone? Kira *384# a kowace waya!",
    ndpa: "NDPA 2023 Compliant",
    ndpaSub: "An kare bayananka · Privacy by design",
    quickReplies: ["Shawarar shuka", "Yanayin ruwa", "Maganin kwari", "CashCard"],
    noInternet: "Ba buƙatar internet a USSD · Akwai cikin harsuna 5",
    team: "Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief",
    palette: "Sandy Serenity Palette",
    backToHome: "Koma gida",
    farmerNotes: "Bayanan manomi (na zaɓi)",
    notesPlaceholder: "Misali: Masara, makonni 6, rawaya a kan ganye",
    runPipeline: "Gudanar da pipeline",
    reset: "Sake saiti",
    smsSent: "SMS an aika",
    confidence: "Tabbaci",
    removeInfected: "Cire tsire-tsire da suka kamu. Fesa man neem.",
    reply: "Amsa",
    typeMessage: "Rubuta tambayar ka...",
    replyToAgrion: "Amsa wa Agrion...",
    grounded: "An tabbatar da bayanan Neo4j",
    aiThinking: "AgriConnect AI yana tunani...",
    offline: "Ba buƙatar internet a USSD",
  },
  yo: {
    appName: "AgriConnect",
    tagline: "Ogbin daradara, papọ",
    welcome: "Gba imọran lẹsẹkẹsẹ — ko nilo akọọlẹ.",
    welcomeSub: "Beere awọn ibeere, ṣayẹwo awọn irugbin rẹ, ki o ka awọn imọran SMS — gbogbo rẹ ni ede rẹ.",
    chatTitle: "Oluranlọwọ Ibaṣepọ AI",
    chatSub: "Beere ohunkohun nipa oko rẹ",
    visionTitle: "Ṣiṣayẹwo Fọto Irugbin",
    visionSub: "Gbe fọto lati ṣe awari awọn arun & kokoro",
    smsTitle: "Apoti SMS",
    smsSub: "Awọn ifiranṣẹ meji pẹlu Imọran Agrion",
    upload: "Ju fọto si ibi tabi tẹ lati gbe",
    uploadSub: "JPG · PNG · HEIC",
    analyze: "Ṣe itupalẹ fọto",
    pipelineTitle: "Vision Pipeline · Live",
    pipelineDesc: "Gbe fọto irugbin rẹ ki o ṣiṣẹ nipasẹ awọn ipele mẹrin ti Alfred.",
    stage1: "Ipele 1 — Gbigba (MMS received)",
    stage2: "Ipele 2 — AI upscaling & denoising",
    stage3: "Ipele 3 — Vision LLM analysis",
    stage4: "Ipele 4 — Firanse SMS nipasẹ Africa's Talking",
    smsPreview: "SMS ti a firanse si agbẹ",
    noAccount: "Ko ni smartphone? Pe *384# lori foonu eyikeyi!",
    ndpa: "NDPA 2023 Compliant",
    ndpaSub: "Aabo data rẹ · Privacy by design",
    quickReplies: ["Imọran dida", "Asọtẹlẹ ojo", "Iṣakoso kokoro", "CashCard"],
    noInternet: "Ko nilo intanẹẹti lori USSD · Wa ni awọn ede 5",
    team: "Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief",
    palette: "Sandy Serenity Palette",
    backToHome: "Pada si ile",
    farmerNotes: "Awọn akọsilẹ agbẹ (iyan)",
    notesPlaceholder: "Fun apẹẹrẹ: Agbado, ọsẹ 6, awọ ofeefee lori awọn ewe",
    runPipeline: "Ṣiṣẹ pipeline",
    reset: "Tunto",
    smsSent: "SMS ti firanse",
    confidence: "Idaniloju",
    removeInfected: "Yọ awọn ohun ọgbin ti o ni arun kuro. Fun ni epo neem.",
    reply: "Dahun",
    typeMessage: "Tẹ ibeere rẹ...",
    replyToAgrion: "Dahun si Agrion...",
    grounded: "Ti ṣe idiwọn ninu data Neo4j",
    aiThinking: "AgriConnect AI n ronu...",
    offline: "Ko nilo intanẹẹti lori USSD",
  },
  ig: {
    appName: "AgriConnect",
    tagline: "Ọrụ ugbo ka mma, ọnụ",
    welcome: "Nweta ndụmọdụ ozugbo — ọ dịghị mkpa akaụntụ.",
    welcomeSub: "Jụọ ajụjụ, nyochaa ihe ọkụkụ gị, ma gụọ ndụmọdụ SMS — ha niile n'asụsụ gị.",
    chatTitle: "Onye Nnyema Okwu AI",
    chatSub: "Jụọ ihe ọ bụla gbasara ugbo gị",
    visionTitle: "Nyocha Foto Ihe Ọkụkụ",
    visionSub: "Bulite foto iji chọpụta ọrịa & ahụhụ",
    smsTitle: "Igbe SMS",
    smsSub: "Ozi ụzọ abụọ na Ndụmọdụ Agrion",
    upload: "Tụpụ foto ebe a ma ọ bụ pịa ibulite",
    uploadSub: "JPG · PNG · HEIC",
    analyze: "Nyochaa foto",
    pipelineTitle: "Vision Pipeline · Live",
    pipelineDesc: "Bulite foto ihe ọkụkụ gị ma mee ya site na usoro anọ nke Alfred.",
    stage1: "Usoro 1 — Nnara (MMS received)",
    stage2: "Usoro 2 — AI upscaling & denoising",
    stage3: "Usoro 3 — Vision LLM analysis",
    stage4: "Usoro 4 — Izipu SMS site na Africa's Talking",
    smsPreview: "SMS ezigara onye ọrụ ugbo",
    noAccount: "Ị nweghị smartphone? Kpọọ *384# na ekwentị ọ bụla!",
    ndpa: "NDPA 2023 Compliant",
    ndpaSub: "Echekwabara data gị · Privacy by design",
    quickReplies: ["Ndụmọdụ ịkụ", "Amụma ihu igwe", "Ịchịkwa ahụhụ", "CashCard"],
    noInternet: "Ọ dịghị mkpa ịntanetị na USSD · Dị na asụsụ 5",
    team: "Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief",
    palette: "Sandy Serenity Palette",
    backToHome: "Laghachi n'ụlọ",
    farmerNotes: "Ihe edetara onye ọrụ ugbo (nhọrọ)",
    notesPlaceholder: "Ọmụmaatụ: Ọka, izu 6, ịcha odo na akwụkwọ",
    runPipeline: "Gbaa pipeline",
    reset: "Tọgharịa",
    smsSent: "SMS ezitere",
    confidence: "Ntụkwasị obi",
    removeInfected: "Wepụ osisi ndị butere ọrịa. Fesa mmanụ neem.",
    reply: "Zaghachi",
    typeMessage: "Dee ajụjụ gị...",
    replyToAgrion: "Zaghachi Agrion...",
    grounded: "Gbakwasara na data Neo4j",
    aiThinking: "AgriConnect AI na-eche...",
    offline: "Ọ dịghị mkpa ịntanetị na USSD",
  },
  pcm: {
    appName: "AgriConnect",
    tagline: "Farm beta, together",
    welcome: "Get farm advice straight away — no need account.",
    welcomeSub: "Ask questions, check your crops, and read SMS advice — all for your language.",
    chatTitle: "AI Chat Assistant",
    chatSub: "Ask anything about your farm",
    visionTitle: "Crop Photo Check",
    visionSub: "Upload photo to find disease & pests",
    smsTitle: "SMS Box",
    smsSub: "Two-way messages with Agrion Advisory",
    upload: "Drop photo here or click to upload",
    uploadSub: "JPG · PNG · HEIC",
    analyze: "Check photo",
    pipelineTitle: "Vision Pipeline · Live",
    pipelineDesc: "Upload your crop photo and run am through Alfred's four-stage pipeline.",
    stage1: "Stage 1 — Backend capture (MMS received)",
    stage2: "Stage 2 — AI upscaling & denoising",
    stage3: "Stage 3 — Vision LLM analysis",
    stage4: "Stage 4 — Sending SMS through Africa's Talking",
    smsPreview: "SMS wey go reach farmer",
    noAccount: "You no get smartphone? Dial *384# on any phone!",
    ndpa: "NDPA 2023 Compliant",
    ndpaSub: "Your data dey safe · Privacy by design",
    quickReplies: ["Planting advice", "Weather forecast", "Pest control", "CashCard"],
    noInternet: "No internet needed on USSD · Dey for 5 languages",
    team: "Team Agrion · Kenya AI Challenge 2026 · Crop2Cash Brief",
    palette: "Sandy Serenity Palette",
    backToHome: "Back to home",
    farmerNotes: "Farmer notes (optional)",
    notesPlaceholder: "e.g. Maize, 6 weeks, yellowing on lower leaves",
    runPipeline: "Run pipeline",
    reset: "Reset",
    smsSent: "SMS don send",
    confidence: "Confidence",
    removeInfected: "Remove infected plants. Spray neem oil.",
    reply: "Reply",
    typeMessage: "Type your question...",
    replyToAgrion: "Reply to Agrion...",
    grounded: "Grounded for Neo4j data",
    aiThinking: "AgriConnect AI dey think...",
    offline: "No internet needed on USSD",
  },
};

// ==================== MOCK DATA ====================

// These will be replaced by real API calls to Alfred's backend
const mockChatMessages = [
  { id: 1, sender: "user", text: "When should I plant maize this season?" },
  { id: 2, sender: "ai", text: "Plant maize 2 weeks after the first heavy rain. In your region, that's likely mid-April. Space rows 75cm apart." },
  { id: 3, sender: "user", text: "My tomato leaves are turning yellow. What should I do?" },
  { id: 4, sender: "ai", text: "Yellow leaves often mean nitrogen deficiency. Apply NPK fertilizer and check for whiteflies under the leaves." },
];

const mockSmsData = [
  { id: 1, sender: "Agrion Advisory", content: "Rain expected tomorrow in Kaduna. Delay spraying.", time: "2h ago", fullContent: "Rain expected tomorrow in Kaduna. Delay spraying until after the rain passes for best results." },
  { id: 2, sender: "Agrion Advisory", content: "Maize prices up 12% at Mile 12 market this week.", time: "5h ago", fullContent: "Maize prices up 12% at Mile 12 market this week. Consider selling your harvest now for better returns." },
  { id: 3, sender: "Agrion Advisory", content: "Reminder: Apply second urea dose to maize at 6 weeks.", time: "1d ago", fullContent: "Reminder: Apply second urea dose to maize at 6 weeks after planting. This is critical for maximum yield." },
  { id: 4, sender: "Agrion Advisory", content: "Fall armyworm alert in your LGA. Scout fields now.", time: "2d ago", fullContent: "Fall armyworm alert in your LGA. Scout fields now and apply neem oil if you spot any damage." },
];

const stages = [
  { id: 0, label: "Stage 1 — Backend capture (MMS received)", icon: <Phone className="w-4 h-4" /> },
  { id: 1, label: "Stage 2 — AI upscaling & denoising", icon: <Sparkles className="w-4 h-4" /> },
  { id: 2, label: "Stage 3 — Vision LLM analysis", icon: <Brain className="w-4 h-4" /> },
  { id: 3, label: "Stage 4 — Dispatching SMS via Africa's Talking", icon: <Send className="w-4 h-4" /> },
];

// Add Brain import
import { Brain } from "lucide-react";

export function FarmerAppPage() {
  const [lang, setLang] = useState("en");
  const [darkMode, setDarkMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [smsInput, setSmsInput] = useState("");
  const [selectedSms, setSelectedSms] = useState<number | null>(null);
  const [showFullSms, setShowFullSms] = useState(false);
  
  // Vision Pipeline states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [farmerNotes, setFarmerNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  const [analysisResult, setAnalysisResult] = useState<{ condition: string; confidence: number; sms: string } | null>(null);

  const t = translations[lang as keyof typeof translations] || translations.en;

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Quick replies
  const quickReplies = [
    { label: t.quickReplies[0], icon: <Sprout className="w-4 h-4" /> },
    { label: t.quickReplies[1], icon: <CloudRain className="w-4 h-4" /> },
    { label: t.quickReplies[2], icon: <Bug className="w-4 h-4" /> },
    { label: t.quickReplies[3], icon: <CreditCard className="w-4 h-4" /> },
  ];

  // ==================== AI CHAT HANDLERS ====================

  // This is where Alfred's API will connect
  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = { id: chatMessages.length + 1, sender: "user" as const, text: message };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsAiThinking(true);

    try {
      // 🔥 REPLACE WITH ALFRED'S REAL API CALL
      // const response = await fetch('http://localhost:8000/api/v1/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     message: message, 
      //     language: lang,
      //     session_id: 'web-001'
      //   })
      // });
      // const data = await response.json();

      // ⚡ MOCK RESPONSE (replace with real API call)
      const mockResponse = {
        advisory: getMockAdvisory(message, lang),
        isGrounded: true,
        sources: ["NiMet 2026", "IITA Maize Guide"],
        language: lang
      };

      // Add AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: prev.length + 1,
          sender: "ai" as const,
          text: mockResponse.advisory,
          isGrounded: mockResponse.isGrounded,
          sources: mockResponse.sources
        }]);
        setIsAiThinking(false);
      }, 800);

    } catch (error) {
      console.error("AI Chat error:", error);
      setChatMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "ai" as const,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        isGrounded: false,
        sources: []
      }]);
      setIsAiThinking(false);
    }
  };

  // Mock responses by language (replace with real AI)
  const getMockAdvisory = (message: string, langCode: string) => {
    const responses: Record<string, Record<string, string>> = {
      en: {
        planting: "Plant maize 2 weeks after the first heavy rain. In your region, that's mid-April. Space rows 75cm apart. Use SAMMAZ 15 variety for drought tolerance.",
        weather: "Based on NiMet data, rains will be late this season. Expect dry spells in May. Delay planting by 2 weeks.",
        pest: "Spray neem oil extract early morning or late evening. Apply Lambda-cyhalothrin 2.5EC if infestation is severe. Monitor daily.",
        cash: "Save ₦2,000 on your CashCard before buying fertilizer. You have 14 days to prepare.",
        default: "Based on NiMet and IITA data: Rains will be late this season. Wait 2 weeks before planting. Use SAMMAZ 15."
      },
      ha: {
        planting: "Shuka masara makonni 2 bayan ruwan sama na farko. A yankinku, wannan shine tsakiyar Afrilu. Rarraba layuka 75cm. Yi amfani da SAMMAZ 15.",
        weather: "Dangane da bayanan NiMet, ruwan sama zai makara wannan kakar. Tsammani fari a watan Mayu. Jira makonni 2.",
        pest: "Fesa man neem da safe ko da yamma. Yi amfani da Lambda-cyhalothrin 2.5EC idan cutar ta yi tsanani.",
        cash: "Ajiye ₦2,000 akan CashCard kafin sayo taki. Kana da kwanaki 14.",
        default: "Dangane da bayanan NiMet da IITA: Ruwan sama zai makara wannan kakar. Jira makonni 2 kafin dasa."
      },
      yo: {
        planting: "Gbin agbado ọsẹ 2 lẹhin ojo nla akọkọ. Ni agbegbe rẹ, iyẹn jẹ aarin Oṣu Kẹrin. Aaye awọn ila 75cm. Lo SAMMAZ 15.",
        weather: "Da data NiMet, ojo yoo pẹ ni akoko yii. Reti ogbele ni May. Duro ọsẹ 2.",
        pest: "Fun ni epo neem ni kutukutu owurọ tabi aṣalẹ. Lo Lambda-cyhalothrin 2.5EC ti o ba jẹ lile.",
        cash: "Fipamọ ₦2,000 lori CashCard ṣaaju ra ajile. O ni ọjọ 14.",
        default: "Da data NiMet ati IITA: Ojo yoo pẹ ni akoko yii. Duro ọsẹ 2 ṣaaju dida."
      },
      ig: {
        planting: "Kụ ọka izu 2 mgbe nnukwu mmiri ozuzo mbụ gasịrị. Na mpaghara gị, nke ahụ bụ etiti Eprel. Hapụ ahịrị 75cm. Jiri SAMMAZ 15.",
        weather: "Dabere na data NiMet, mmiri ozuzo ga-egbu oge n'oge a. Atụmanya ọkọchị na May. Chere izu 2.",
        pest: "Fesa mmanụ neem n'ụtụtụ ma ọ bụ mgbede. Jiri Lambda-cyhalothrin 2.5EC ma ọ bụrụ na ọka njọ.",
        cash: "Chekwaa ₦2,000 na CashCard gị tupu ịzụta fatiliza. Ị nwere ụbọchị 14.",
        default: "Dabere na data NiMet na IITA: Mmiri ozuzo ga-egbu oge n'oge a. Chere izu 2 tupu ịkụ."
      },
      pcm: {
        planting: "Plant maize 2 weeks after the first heavy rain. For your area, that be mid-April. Space rows 75cm apart. Use SAMMAZ 15.",
        weather: "Based on NiMet data, rain go dey late this season. Expect dry weather for May. Wait 2 weeks.",
        pest: "Spray neem oil for morning or evening. Use Lambda-cyhalothrin 2.5EC if e bad.",
        cash: "Save ₦2,000 for your CashCard before you buy fertilizer. You get 14 days.",
        default: "Based on NiMet and IITA data: Rain go dey late this season. Wait 2 weeks before planting."
      }
    };

    const langResponses = responses[langCode] || responses.en;
    
    if (message.toLowerCase().includes("plant") || message.toLowerCase().includes("shuka") || message.toLowerCase().includes("gbin") || message.toLowerCase().includes("kụ")) {
      return langResponses.planting;
    }
    if (message.toLowerCase().includes("weather") || message.toLowerCase().includes("rain") || message.toLowerCase().includes("ruwan") || message.toLowerCase().includes("ojo") || message.toLowerCase().includes("mmiri")) {
      return langResponses.weather;
    }
    if (message.toLowerCase().includes("pest") || message.toLowerCase().includes("bug") || message.toLowerCase().includes("kwari") || message.toLowerCase().includes("ahụhụ")) {
      return langResponses.pest;
    }
    if (message.toLowerCase().includes("cash") || message.toLowerCase().includes("money") || message.toLowerCase().includes("kuɗi") || message.toLowerCase().includes("ego")) {
      return langResponses.cash;
    }
    return langResponses.default;
  };

  // ==================== VISION PIPELINE HANDLERS ====================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setAnalysisResult(null);
        setCurrentStage(-1);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setAnalysisResult(null);
        setCurrentStage(-1);
      };
      reader.readAsDataURL(file);
    }
  };

  // 🔥 Replace with Alfred's real Vision API
  const runPipeline = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setCurrentStage(-1);

    const runStages = async () => {
      for (let i = 0; i < stages.length; i++) {
        setCurrentStage(i);
        await new Promise(r => setTimeout(r, 700 + i * 300));
      }
      
      // ⚡ MOCK RESULT (replace with real Vision API call)
      // const visionResponse = await fetch('http://localhost:8000/api/v1/vision', {
      //   method: 'POST',
      //   body: formData
      // });
      
      setAnalysisResult({
        condition: "Maize Streak Virus",
        confidence: 87,
        sms: "AGRION: Likely Maize Streak Virus. Remove infected plants. Spray neem oil. Reply HELP for more."
      });
      setIsAnalyzing(false);
    };

    runStages();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setCurrentStage(-1);
    setIsAnalyzing(false);
    setFarmerNotes("");
  };

  // SMS Click handler
  const handleSmsClick = (id: number) => {
    setSelectedSms(selectedSms === id ? null : id);
    setShowFullSms(true);
  };

  const smsCount = mockSmsData.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-marigold" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AgriConnect</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Nigeria</span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 outline-none"
              >
                <option value="en">English</option>
                <option value="ha">Hausa</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="pcm">Pidgin</option>
              </select>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </header>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-marigold/10 to-marigold/5 dark:from-marigold/20 dark:to-transparent rounded-xl p-6 mb-8 border border-marigold/20 dark:border-marigold/10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.welcome}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">{t.welcomeSub}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="text-xs bg-marigold/20 text-marigold px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> No account needed
              </span>
              <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                <Phone className="w-3 h-3" /> *384#
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> 5 languages
              </span>
            </div>
          </div>

          {/* Main Grid: Chat + Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* AI Chat */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-marigold" />
                  {t.chatTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.chatSub}</p>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-marigold text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                    }`}>
                      {msg.text}
                      {(msg as any).isGrounded !== undefined && (
                        <div className="mt-1 text-[10px] flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {t.grounded}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-lg rounded-bl-none max-w-[80%] flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-marigold animate-spin" />
                      <span className="text-sm">{t.aiThinking}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickReplies.map((reply, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => sendChatMessage(reply.label)}
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-marigold/20 transition-colors flex items-center gap-1"
                    >
                      {reply.icon}
                      {reply.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t.typeMessage}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage(chatInput)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-marigold"
                  />
                  <button 
                    onClick={() => sendChatMessage(chatInput)}
                    className="px-4 py-2 bg-marigold hover:bg-marigold/80 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Vision Pipeline */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-marigold" />
                  {t.visionTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.visionSub}</p>
              </div>
              <div className="p-4">
                {!selectedImage ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging ? 'border-marigold bg-marigold/10' : 'border-gray-300 dark:border-gray-600 hover:border-marigold'
                    }`}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">{t.upload}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{t.uploadSub}</p>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img src={selectedImage} alt="Crop" className="w-full max-h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700" />
                    <textarea
                      value={farmerNotes}
                      onChange={(e) => setFarmerNotes(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      className="w-full p-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-marigold"
                      rows={2}
                    />
                    
                    {/* Pipeline Stages */}
                    <div className="space-y-1.5">
                      {stages.map((stage) => (
                        <div key={stage.id} className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          currentStage >= stage.id
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : isAnalyzing && currentStage === stage.id - 1
                            ? 'bg-marigold/10 text-marigold animate-pulse'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        }`}>
                          {stage.icon}
                          <span className="flex-1">{stage.label}</span>
                          {currentStage >= stage.id && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {isAnalyzing && currentStage === stage.id - 1 && <Loader2 className="w-4 h-4 text-marigold animate-spin" />}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={runPipeline}
                        disabled={isAnalyzing || !selectedImage}
                        className="flex-1 py-2 bg-marigold hover:bg-marigold/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {isAnalyzing ? "Processing..." : t.runPipeline}
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {t.reset}
                      </button>
                    </div>

                    {analysisResult && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-300">{analysisResult.condition}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">{t.confidence}: {analysisResult.confidence}%</p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{analysisResult.sms}</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.smsSent}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SMS Inbox */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-marigold" />
                  {t.smsTitle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.smsSub}</p>
              </div>
              <span className="text-xs bg-marigold/20 text-marigold px-2 py-1 rounded">{smsCount} messages</span>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {mockSmsData.map((sms) => (
                <div
                  key={sms.id}
                  onClick={() => handleSmsClick(sms.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSms === sms.id
                      ? 'bg-marigold/10 border border-marigold'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-marigold">{sms.sender}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{sms.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedSms === sms.id && showFullSms ? sms.fullContent : sms.content}
                  </p>
                  {selectedSms === sms.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder={t.replyToAgrion}
                        value={smsInput}
                        onChange={(e) => setSmsInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-marigold"
                      />
                      <button className="px-3 py-1.5 bg-marigold hover:bg-marigold/80 text-white rounded-lg text-sm font-medium transition-colors">
                        {t.reply}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 pt-6 pb-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center gap-1">
              <Phone className="w-4 h-4" />
              {t.noAccount}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <Shield className="w-4 h-4 text-marigold" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{t.ndpa}</span>
              <span>·</span>
              <span>{t.ndpaSub}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.team} · {t.palette}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}