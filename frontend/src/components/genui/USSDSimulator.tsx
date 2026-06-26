import type { USSDSimulatorBlock } from "./types";
import { useState } from "react";
import { 
  Phone, 
  Globe, 
  Sprout, 
  MapPin, 
  CalendarDays,
  Send,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  CreditCard
} from "lucide-react";

interface Props {
  block: USSDSimulatorBlock;
}

export function USSDSimulator({ block }: Props) {
  const [currentStep, setCurrentStep] = useState(block.currentStep);
  const [selectedLanguage, setSelectedLanguage] = useState("Hausa");
  const [selectedCrop, setSelectedCrop] = useState("Maize");
  const [selectedRegion, setSelectedRegion] = useState("Kano");
  const [selectedStage, setSelectedStage] = useState("Pre-planting");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const steps = [
    { label: "Language", icon: <Globe className="w-4 h-4" /> },
    { label: "Crop", icon: <Sprout className="w-4 h-4" /> },
    { label: "Region", icon: <MapPin className="w-4 h-4" /> },
    { label: "Stage", icon: <CalendarDays className="w-4 h-4" /> },
    { label: "Advisory", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "ha", name: "Hausa" },
    { code: "yo", name: "Yoruba" },
    { code: "ig", name: "Igbo" },
    { code: "pcm", name: "Pidgin" },
  ];

  const crops = [
    { id: "maize", name: "Maize", hausa: "Masara", yoruba: "Agbado", igbo: "Ọka", pidgin: "Maize" },
    { id: "rice", name: "Rice", hausa: "Shinkafa", yoruba: "Iresi", igbo: "Osikapa", pidgin: "Rice" },
    { id: "cassava", name: "Cassava", hausa: "Rogo", yoruba: "Ege", igbo: "Akpu", pidgin: "Cassava" },
    { id: "soya", name: "Soya", hausa: "Soya", yoruba: "Soya", igbo: "Soya", pidgin: "Soya" },
  ];

  const regions = [
    { id: "kano", name: "Kano", hausa: "Kano", yoruba: "Kano", igbo: "Kano", pidgin: "Kano" },
    { id: "kaduna", name: "Kaduna", hausa: "Kaduna", yoruba: "Kaduna", igbo: "Kaduna", pidgin: "Kaduna" },
    { id: "kebbi", name: "Kebbi", hausa: "Kebbi", yoruba: "Kebbi", igbo: "Kebbi", pidgin: "Kebbi" },
    { id: "lagos", name: "Lagos", hausa: "Legas", yoruba: "Eko", igbo: "Lagos", pidgin: "Lagos" },
    { id: "oyo", name: "Oyo", hausa: "Oyo", yoruba: "Oyo", igbo: "Oyo", pidgin: "Oyo" },
    { id: "enugu", name: "Enugu", hausa: "Enugu", yoruba: "Enugu", igbo: "Enugu", pidgin: "Enugu" },
  ];

  const stages = [
    { id: "pre", name: "Pre-planting", hausa: "Kafin shuka", yoruba: "Ṣaaju dida", igbo: "Tupu ịkụ", pidgin: "Before planting" },
    { id: "planting", name: "Planting", hausa: "Shuka", yoruba: "Dida", igbo: "Ịkụ", pidgin: "Planting" },
    { id: "growing", name: "Growing", hausa: "Girma", yoruba: "Dagba", igbo: "Itolite", pidgin: "Growing" },
    { id: "harvest", name: "Harvest", hausa: "Girbi", yoruba: "Ikore", igbo: "Owuwe", pidgin: "Harvest" },
  ];

  const handleStepClick = (index: number) => {
    if (index <= currentStep && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep(currentStep + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentStep(currentStep - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    setTimeout(() => handleNext(), 400);
  };

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
    setTimeout(() => handleNext(), 400);
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setTimeout(() => handleNext(), 400);
  };

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setTimeout(() => handleNext(), 400);
  };

  const getTranslation = (item: any, _field: string, langCode: string) => {
    const langMap: Record<string, string> = {
      en: "name",
      ha: "hausa",
      yo: "yoruba",
      ig: "igbo",
      pcm: "pidgin"
    };
    const key = langMap[langCode] || "name";
    return item[key] || item.name;
  };

  const getStepTitle = () => {
    const lang = selectedLanguage.toLowerCase();
    const titles: Record<string, Record<number, string>> = {
      en: { 0: "Select your language", 1: "Select your crop", 2: "Select your state", 3: "What is your farm stage?" },
      ha: { 0: "Zaɓi yarenka", 1: "Zaɓi amfanin gona", 2: "Zaɓi jihar ka", 3: "Menene marhalar noma ka?" },
      yo: { 0: "Yan ede rẹ", 1: "Yan irugbin rẹ", 2: "Yan ipinle rẹ", 3: "Ipele ogbin rẹ?" },
      ig: { 0: "Họrọ asụsụ gị", 1: "Họrọ ihe ọkụkụ gị", 2: "Họrọ steeti gị", 3: "Oge ọrụ ugbo gị?" },
      pcm: { 0: "Choose your language", 1: "Choose your crop", 2: "Choose your state", 3: "Wetin be your farm stage?" },
    };
    return titles[lang]?.[currentStep] || titles.en[currentStep] || "";
  };

  const getStepSubtitle = () => {
    const lang = selectedLanguage.toLowerCase();
    const subtitles: Record<string, Record<number, string>> = {
      en: { 0: "", 1: "", 2: "", 3: "" },
      ha: { 0: "", 1: "(Select your crop)", 2: "(Select your state)", 3: "(What is your farm stage?)" },
      yo: { 0: "", 1: "(Yan irugbin rẹ)", 2: "(Yan ipinle rẹ)", 3: "(Ipele ogbin rẹ?)" },
      ig: { 0: "", 1: "(Họrọ ihe ọkụkụ gị)", 2: "(Họrọ steeti gị)", 3: "(Oge ọrụ ugbo gị?)" },
      pcm: { 0: "", 1: "(Choose your crop)", 2: "(Choose your state)", 3: "(Wetin be your farm stage?)" },
    };
    return subtitles[lang]?.[currentStep] || "";
  };

  const getStepContent = () => {
    const lang = selectedLanguage.toLowerCase();
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-3">
            <div className="text-marigold dark:text-dark-accent text-sm font-medium">
              {getStepTitle()}
            </div>
            {getStepSubtitle() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{getStepSubtitle()}</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {languages.map((langOpt) => {
                const langNameMap: Record<string, Record<string, string>> = {
                  en: { en: "English", ha: "Hausa", yo: "Yoruba", ig: "Igbo", pcm: "Pidgin" },
                  ha: { en: "Turanci", ha: "Hausa", yo: "Yarbanci", ig: "Igbo", pcm: "Pidgin" },
                  yo: { en: "Gẹẹsi", ha: "Hausa", yo: "Yoruba", ig: "Igbo", pcm: "Pidgin" },
                  ig: { en: "Bekee", ha: "Hausa", yo: "Yoruba", ig: "Igbo", pcm: "Pidgin" },
                  pcm: { en: "English", ha: "Hausa", yo: "Yoruba", ig: "Igbo", pcm: "Pidgin" },
                };
                const displayName = langNameMap[lang]?.[langOpt.code] || langOpt.name;
                return (
                  <button
                    key={langOpt.code}
                    onClick={() => handleLanguageSelect(langOpt.name)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedLanguage === langOpt.name
                        ? 'border-marigold dark:border-dark-accent bg-marigold/10 dark:bg-dark-accent/10'
                        : 'border-gray-600 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                      {selectedLanguage === langOpt.name && (
                        <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter option: {languages.findIndex(l => l.name === selectedLanguage) + 1}</div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            <div className="text-marigold dark:text-dark-accent text-sm font-medium">
              {getStepTitle()}
            </div>
            {getStepSubtitle() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{getStepSubtitle()}</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {crops.map((crop) => {
                const displayName = getTranslation(crop, "name", lang);
                return (
                  <button
                    key={crop.id}
                    onClick={() => handleCropSelect(crop.name)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedCrop === crop.name
                        ? 'border-marigold dark:border-dark-accent bg-marigold/10 dark:bg-dark-accent/10'
                        : 'border-gray-600 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4 text-marigold dark:text-dark-accent" />
                      <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                      {selectedCrop === crop.name && (
                        <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <button onClick={handleBack} className="hover:text-gray-900 dark:hover:text-white">0. Koma (Back)</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <div className="text-marigold dark:text-dark-accent text-sm font-medium">
              {getStepTitle()}
            </div>
            {getStepSubtitle() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{getStepSubtitle()}</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {regions.map((region) => {
                const displayName = getTranslation(region, "name", lang);
                return (
                  <button
                    key={region.id}
                    onClick={() => handleRegionSelect(region.name)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedRegion === region.name
                        ? 'border-marigold dark:border-dark-accent bg-marigold/10 dark:bg-dark-accent/10'
                        : 'border-gray-600 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-marigold dark:text-dark-accent" />
                      <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                      {selectedRegion === region.name && (
                        <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <button onClick={handleBack} className="hover:text-gray-900 dark:hover:text-white">0. Koma (Back)</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <div className="text-marigold dark:text-dark-accent text-sm font-medium">
              {getStepTitle()}
            </div>
            {getStepSubtitle() && (
              <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{getStepSubtitle()}</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {stages.map((stage) => {
                const displayName = getTranslation(stage, "name", lang);
                return (
                  <button
                    key={stage.id}
                    onClick={() => handleStageSelect(stage.name)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStage === stage.name
                        ? 'border-marigold dark:border-dark-accent bg-marigold/10 dark:bg-dark-accent/10'
                        : 'border-gray-600 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-marigold dark:text-dark-accent" />
                      <span className="text-sm text-gray-900 dark:text-white">{displayName}</span>
                      {selectedStage === stage.name && (
                        <CheckCircle className="w-4 h-4 text-marigold dark:text-dark-accent ml-auto" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <button onClick={handleBack} className="hover:text-gray-900 dark:hover:text-white">0. Koma (Back)</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <div className="text-marigold dark:text-dark-accent text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-marigold dark:text-dark-accent" />
              <span className="text-gray-900 dark:text-white">NASIHA / ADVISORY</span>
            </div>
            <div className="bg-marigold/5 dark:bg-dark-accent/5 border border-marigold/20 dark:border-dark-accent/20 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">{selectedRegion} · {selectedCrop} · 2026</div>
              <p className="text-sm leading-relaxed text-gray-900 dark:text-white">
                {lang === "ha" 
                  ? `Ruwan sama zai makara a ${selectedRegion} wannan shekarar. Jira makonni 2 kafin dasa. Yi amfani da SAMMAZ 15 wanda yake jurewa fari.`
                  : lang === "yo"
                  ? `Ojo yoo pẹ ni ${selectedRegion} ni ọdun yii. Duro ọsẹ 2 ṣaaju dida. Lo SAMMAZ 15 ti o ko ogbele.`
                  : lang === "ig"
                  ? `Mmiri ozuzo ga-egbu oge na ${selectedRegion} n'afọ a. Chere izu 2 tupu ịkụ. Jiri SAMMAZ 15 nke na-eguzogide ọkọchị.`
                  : lang === "pcm"
                  ? `Rain go late for ${selectedRegion} this year. Wait 2 weeks before planting. Use SAMMAZ 15 wey fit survive dry weather.`
                  : `Rains will be late in ${selectedRegion} this year. Wait 2 weeks before planting. Use SAMMAZ 15 which is drought-tolerant.`
                }
              </p>
              <div className="bg-marigold/10 dark:bg-dark-accent/10 border border-marigold/30 dark:border-dark-accent/30 rounded p-2">
                <p className="text-xs text-marigold dark:text-dark-accent flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span className="text-gray-900 dark:text-white">{lang === "ha" 
                    ? `Ajiye ₦2,000 akan CashCard kafin sayo taki`
                    : lang === "yo"
                    ? `Fipamọ ₦2,000 lori CashCard rẹ ṣaaju ra ajile`
                    : lang === "ig"
                    ? `Chekwaa ₦2,000 na CashCard gị tupu ịzụta fatiliza`
                    : lang === "pcm"
                    ? `Save ₦2,000 for your CashCard before you buy fertilizer`
                    : `Save ₦2,000 on your CashCard before buying fertilizer`
                  }</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>SMS an aika ✓</span>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-600 dark:border-gray-600 rounded-lg transition-colors"
            >
              0. Ƙarshe (End Session)
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getCurrentStepInfo = () => {
    const labels = {
      en: ["Language", "Crop", "Region", "Stage", "Advisory"],
      ha: ["Yare", "Amfanin gona", "Jiha", "Marhalar noma", "Nasiha"],
      yo: ["Ede", "Irugbin", "Ipinle", "Ipele", "Imọran"],
      ig: ["Asụsụ", "Ihe ọkụkụ", "Steeti", "Oge", "Ndụmọdụ"],
      pcm: ["Language", "Crop", "Region", "Stage", "Advisory"],
    };
    const lang = selectedLanguage.toLowerCase();
    const label = labels[lang as keyof typeof labels] || labels.en;
    return { number: currentStep + 1, total: 5, label: label[currentStep] };
  };

  const stepInfo = getCurrentStepInfo();

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Phone className="w-5 h-5 text-marigold dark:text-dark-accent" />
          USSD Flow Simulator
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 px-2 py-1 rounded font-mono">*384#</span>
          <button 
            onClick={handleReset}
            className="text-xs text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-dallas dark:text-dark-text2 font-mono">
            *384#
          </span>
          <span className="text-xs text-dallas dark:text-dark-text2">
            Step {stepInfo.number} of {stepInfo.total} · {stepInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`flex-1 h-2 rounded-full transition-all ${
                index < currentStep 
                  ? 'bg-marigold dark:bg-dark-accent' 
                  : index === currentStep 
                    ? 'bg-marigold dark:bg-dark-accent animate-pulse' 
                    : 'bg-cream dark:bg-dark-bg2'
              }`}
              disabled={index > currentStep}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`text-[8px] uppercase tracking-wider ${
                index <= currentStep 
                  ? 'text-marigold dark:text-dark-accent' 
                  : 'text-dallas dark:text-dark-text2'
              }`}
              disabled={index > currentStep}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-5 min-h-[340px] font-mono text-sm transition-all duration-300">
        <div className="flex justify-between text-xs text-ussd-dim mb-4">
          <span>*384#</span>
          <span>Step {stepInfo.number} of {stepInfo.total}</span>
        </div>
        {getStepContent()}
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currentStep === 0
              ? 'bg-cream dark:bg-dark-bg2 text-dallas/50 dark:text-dark-text2/50 cursor-not-allowed'
              : 'bg-cream dark:bg-dark-bg2 hover:bg-sand/20 dark:hover:bg-dark-bg3 text-thunder dark:text-dark-text'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button 
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            currentStep === steps.length - 1
              ? 'bg-green-600/50 text-white/50 cursor-not-allowed'
              : 'bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white'
          }`}
        >
          {currentStep === steps.length - 1 ? (
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
          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-red-500/10 hover:bg-red-500/20 text-red-400"
          title="End Session"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 p-2 rounded">
        <span className="font-medium">Session:</span>
        <span>{selectedLanguage} · {selectedCrop} · {selectedRegion} · {selectedStage}</span>
        <span className="w-1 h-1 rounded-full bg-dallas/30"></span>
        <span className="text-green-500">● Active</span>
      </div>
    </div>
  );
}