import type { SMSPreviewBlock } from "./types";
import { useState } from "react";
import { 
  MessageSquare, 
  Copy, 
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface Props {
  block: SMSPreviewBlock;
}

export function SMSPreview({ block }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState(block.selectedLanguage || "en");
  const [selectedTemplate, setSelectedTemplate] = useState(block.selectedTemplate || "advisory");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const templates = [
    { id: "advisory", label: "Advisory", icon: "🌾" },
    { id: "finance", label: "Finance Nudge", icon: "💰" },
    { id: "image", label: "Image Upload", icon: "📷" },
    { id: "confirmation", label: "Confirmation", icon: "✅" },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ha", name: "Hausa", flag: "🇳🇬" },
    { code: "yo", name: "Yoruba", flag: "🇳🇬" },
    { code: "ig", name: "Igbo", flag: "🇳🇬" },
  ];

  // SMS content in all 4 languages
  const smsContent: Record<string, Record<string, string>> = {
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
  };

  const getCurrentSms = () => {
    return smsContent[selectedTemplate]?.[selectedLanguage] || smsContent.advisory.en;
  };

  const getCharacterCount = () => {
    return getCurrentSms().length;
  };

  const getMaxChars = () => 160;

  const getSegments = () => {
    const count = getCharacterCount();
    if (count <= 160) return 1;
    if (count <= 320) return 2;
    return Math.ceil(count / 153);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentSms());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageDisplay = (langCode: string) => {
    const lang = languages.find(l => l.code === langCode);
    return lang ? `${lang.flag} ${lang.name}` : langCode;
  };

  const getTemplateDisplay = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? `${template.icon} ${template.label}` : templateId;
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-marigold dark:text-dark-accent" />
          SMS Preview
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 px-2 py-1 rounded">
            {getSegments()} segment{getSegments() > 1 ? "s" : ""} · {getCharacterCount()}/{getMaxChars()} chars
          </span>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedLanguage === lang.code
                ? 'bg-marigold dark:bg-dark-accent text-white'
                : 'bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 hover:bg-sand/20 dark:hover:bg-dark-bg3'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      {/* Template Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTemplate === template.id
                ? 'bg-copper dark:bg-dark-text3 text-white'
                : 'bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2 hover:bg-sand/20 dark:hover:bg-dark-bg3'
            }`}
          >
            {template.icon} {template.label}
          </button>
        ))}
      </div>

      {/* SMS Preview Box */}
      <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-ussd-dim font-mono">
            {getLanguageDisplay(selectedLanguage)} · {getTemplateDisplay(selectedTemplate)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-ussd-dim hover:text-ussd-text transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={handleCopy}
              className="text-ussd-dim hover:text-ussd-text transition-colors flex items-center gap-1"
              title="Copy to clipboard"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
        <div className={`text-serria font-mono text-sm leading-relaxed transition-all ${
          expanded ? '' : 'line-clamp-2'
        }`}>
          "{getCurrentSms()}"
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-ussd-dim/30">
          <span className={`text-xs font-mono ${
            getCharacterCount() <= 160 
              ? 'text-green-500' 
              : getCharacterCount() <= 320 
                ? 'text-amber-500' 
                : 'text-red-500'
          }`}>
            {getCharacterCount()} / {getMaxChars()} characters
          </span>
          <span className="text-xs text-ussd-dim">
            {getSegments()} SMS segment{getSegments() > 1 ? "s" : ""}
          </span>
          {getSegments() > 1 && (
            <span className="text-xs text-amber-500">
              ⚠️ Will be split into {getSegments()} messages
            </span>
          )}
        </div>
      </div>

      {/* All Templates Preview (when expanded) */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold text-dallas dark:text-dark-text2 uppercase tracking-wider">
            All Templates ({getLanguageDisplay(selectedLanguage)})
          </div>
          {templates.map((template) => {
            const content = smsContent[template.id]?.[selectedLanguage] || "Content not available";
            const count = content.length;
            return (
              <div key={template.id} className="bg-cream dark:bg-dark-bg2 rounded-lg p-3 border border-sand/50 dark:border-dark-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-dallas dark:text-dark-text2">
                    {template.icon} {template.label}
                  </span>
                  <span className={`text-[10px] font-mono ${
                    count <= 160 ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    {count} chars
                  </span>
                </div>
                <p className="text-sm text-thunder dark:text-dark-text font-mono leading-relaxed">
                  "{content}"
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Guide */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 p-2 rounded">
        <span className="font-medium">SMS Guidelines:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          ≤160 chars = 1 segment
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          161-320 chars = 2 segments
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          &gt;320 chars = 3+ segments
        </span>
        <span className="text-[9px] text-copper">• Avoid jargon • Use local language</span>
      </div>
    </div>
  );
}