import type { TTSBlock } from "./types";
import { Volume2, Play, Pause } from "lucide-react";

interface Props {
  block: TTSBlock;
}

export function TTSOutput({ block }: Props) {
  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-marigold dark:text-dark-accent" />
          TTS Output
        </h3>
        <span className="text-xs text-dallas dark:text-dark-text2">
          {block.duration}s · {block.language}
        </span>
      </div>

      <div className="bg-ussd-bg dark:bg-ussd-bg rounded-lg p-4">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-marigold dark:bg-dark-accent flex items-center justify-center hover:bg-marigold/80 dark:hover:bg-dark-accent/80 transition-colors">
            {block.isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-cream dark:bg-dark-bg2 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-marigold dark:bg-dark-accent transition-all duration-300 ${
                    block.isPlaying ? 'w-3/4' : 'w-0'
                  }`}
                ></div>
              </div>
              <span className="text-xs text-ussd-dim">
                {block.isPlaying ? 'Playing...' : 'Ready'}
              </span>
            </div>
            <p className="text-sm text-serria font-mono mt-2 leading-relaxed">
              "{block.text}"
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-dallas dark:text-dark-text2 bg-cream dark:bg-dark-bg2 p-2 rounded">
        <span className="w-2 h-2 bg-marigold dark:bg-dark-accent rounded-full"></span>
        ElevenLabs TTS · Local dialect synthesis
      </div>
    </div>
  );
}