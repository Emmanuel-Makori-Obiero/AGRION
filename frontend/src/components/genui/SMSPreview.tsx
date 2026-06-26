import type { SMSPreviewBlock } from "./types";
import { useState } from "react";
import { 
  MessageSquare, 
  Copy, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Image,
  Check,
  AlertCircle
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
    { id: "advisory", label: "Advisory", icon: <FileText className="w-3 h-3" /> },
    { id: "finance", label: "Finance Nudge", icon: <DollarSign className="w-3 h-3" /> },
    { id: "image", label: "Image Upload", icon: <Image className="w-3 h-3" /> },
    { id: "confirmation", label: "Confirmation", icon: <Check className="w-3 h-3" /> },
  ];

  const languages = [
    { code: "en", name: "English", flag: "GB" },
    { code: "ha", name: "Hausa", flag: "NG" },
    { code: "yo", name: "Yoruba", flag: "NG" },
    { code: "ig", name: "Igbo", flag: "NG" },
  ];

  const getCurrentSms = () => {
    return block.content?.[selectedTemplate]?.[selectedLanguage] || "Content not available";
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

  const getCharStatusColor = () => {
    const count = getCharacterCount();
    if (count <= 160) return 'text-green-600 dark:text-green-400';
    if (count <= 320) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-marigold dark:text-dark-accent" />
          SMS Preview
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
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
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedTemplate === template.id
                ? 'bg-marigold/20 dark:bg-dark-accent/20 text-marigold dark:text-dark-accent border border-marigold/30 dark:border-dark-accent/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {template.icon}
            {template.label}
          </button>
        ))}
      </div>

      {/* SMS Preview Box */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-mono">
            {languages.find(l => l.code === selectedLanguage)?.flag} {languages.find(l => l.code === selectedLanguage)?.name} · {templates.find(t => t.id === selectedTemplate)?.label}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1"
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
        <div className={`text-gray-200 font-mono text-sm leading-relaxed transition-all ${
          expanded ? '' : 'line-clamp-2'
        }`}>
          "{getCurrentSms()}"
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
          <span className={`text-xs font-mono ${getCharStatusColor()}`}>
            {getCharacterCount()} / {getMaxChars()} characters
          </span>
          <span className="text-xs text-gray-400">
            {getSegments()} SMS segment{getSegments() > 1 ? "s" : ""}
          </span>
          {getSegments() > 1 && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Split into {getSegments()} messages
            </span>
          )}
        </div>
      </div>

      {/* All Templates Preview (when expanded) */}
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            All Templates ({languages.find(l => l.code === selectedLanguage)?.name})
          </div>
          {templates.map((template) => {
            const content = block.content?.[template.id]?.[selectedLanguage] || "Content not available";
            const count = content.length;
            return (
              <div key={template.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    {template.icon} {template.label}
                  </span>
                  <span className={`text-[10px] font-mono ${
                    count <= 160 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {count} chars
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                  "{content}"
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Character Guide */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
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
        <span className="text-gray-400">• Avoid jargon • Use local language</span>
      </div>
    </div>
  );
}