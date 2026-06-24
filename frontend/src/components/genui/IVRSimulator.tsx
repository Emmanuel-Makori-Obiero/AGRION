import type { IVRBlock } from "./types";
import { useState } from "react";
import { 
  Phone, 
  PhoneCall,
  PhoneOff,
  Loader2,
  Volume2
} from "lucide-react";

interface Props {
  block: IVRBlock;
}

export function IVRSimulator({ block }: Props) {
  const [isRinging, setIsRinging] = useState(false);
  const [callActive, setCallActive] = useState(false);

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

  const getStatusIcon = () => {
    if (isRinging) return <Loader2 className="w-5 h-5 animate-spin text-marigold" />;
    if (callActive) return <PhoneCall className="w-5 h-5 text-green-500" />;
    return <Phone className="w-5 h-5 text-dallas" />;
  };

  const getStatusText = () => {
    if (isRinging) return "Connecting...";
    if (callActive) return "Call Active";
    return "Tap to Call";
  };

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Phone className="w-5 h-5 text-marigold dark:text-dark-accent" />
          IVR Voice Flow
        </h3>
        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
          callActive 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
            : 'bg-cream dark:bg-dark-bg2 text-dallas dark:text-dark-text2'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            callActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></span>
          {callActive ? 'Live' : 'Standby'}
        </span>
      </div>

      {/* Call Status */}
      <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-marigold/20 flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {getStatusText()}
              </p>
              <p className="text-xs text-ussd-dim">
                Step {block.step} of {block.totalSteps}
              </p>
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

      {/* Current Prompt */}
      <div className="bg-cream dark:bg-dark-bg2 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <Volume2 className="w-4 h-4 text-marigold dark:text-dark-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-dallas dark:text-dark-text2">
              Current Prompt ({block.currentPrompt.language})
            </p>
            <p className="text-sm text-thunder dark:text-dark-text font-medium">
              "{block.currentPrompt.text}"
            </p>
            {block.currentPrompt.translation && (
              <p className="text-xs text-dallas dark:text-dark-text2 mt-1">
                🇬🇧 {block.currentPrompt.translation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      {block.currentPrompt.options && block.currentPrompt.options.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {block.currentPrompt.options.map((option) => (
            <button
              key={option.key}
              className="px-3 py-2 bg-cream dark:bg-dark-bg2 hover:bg-sand/20 dark:hover:bg-dark-bg3 text-thunder dark:text-dark-text rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
            >
              <span>{option.label}</span>
              <span className="text-xs text-dallas dark:text-dark-text2">[{option.key}]</span>
            </button>
          ))}
        </div>
      )}

      {/* Hybrid Bridge Indicator */}
      <div className="mt-3 flex items-center gap-2 text-xs text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 p-2 rounded">
        <span className="w-2 h-2 bg-marigold dark:bg-dark-accent rounded-full animate-pulse"></span>
        Hybrid USSD-IVR Bridge — Farmers can switch between text and voice
      </div>
    </div>
  );
}