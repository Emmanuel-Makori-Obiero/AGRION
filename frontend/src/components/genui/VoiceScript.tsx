import type { VoiceScriptBlock } from "./types";
import { useState } from "react";
import { 
  ScrollText, 
  Play, 
  Pause,
  Languages
} from "lucide-react";

interface Props {
  block: VoiceScriptBlock;
}

export function VoiceScript({ block }: Props) {
  const [selectedLang, setSelectedLang] = useState(block.selectedLanguage);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const scripts = block.scripts.filter(s => s.language === selectedLang);

  const typeLabels = {
    welcome: "Welcome",
    language: "Language Selection",
    crop: "Crop Selection",
    region: "Region Selection",
    stage: "Farm Stage",
    advisory: "Advisory Output",
    goodbye: "Goodbye / End"
  };

  const typeColors = {
    welcome: "border-marigold dark:border-dark-accent",
    language: "border-copper dark:border-dark-text3",
    crop: "border-copper dark:border-dark-text3",
    region: "border-copper dark:border-dark-text3",
    stage: "border-copper dark:border-dark-text3",
    advisory: "border-marigold dark:border-dark-accent",
    goodbye: "border-copper dark:border-dark-text3"
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-marigold dark:text-dark-accent" />
          Voice Script
        </h3>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-dallas dark:text-dark-text2" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs bg-cream dark:bg-dark-bg2 text-thunder dark:text-dark-text border border-sand dark:border-dark-border rounded px-2 py-1 outline-none"
          >
            {block.scripts.map(s => s.language).filter((v, i, a) => a.indexOf(v) === i).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {scripts.map((script) => (
          <div 
            key={script.id} 
            className={`border-l-2 pl-3 ${typeColors[script.type]} transition-colors`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-dallas dark:text-dark-text2">
                {typeLabels[script.type]}
              </p>
              <button
                onClick={() => setPlayingId(playingId === script.id ? null : script.id)}
                className="text-dallas dark:text-dark-text2 hover:text-marigold dark:hover:text-dark-accent transition-colors"
              >
                {playingId === script.id ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
              </button>
            </div>
            <p className="text-sm text-thunder dark:text-dark-text">
              {playingId === script.id ? (
                <span className="text-marigold dark:text-dark-accent">🔊 {script.text}</span>
              ) : (
                `"${script.text}"`
              )}
            </p>
            {script.translation && (
              <p className="text-xs text-dallas dark:text-dark-text2 mt-0.5">
                🇬🇧 {script.translation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}