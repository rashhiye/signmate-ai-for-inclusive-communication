import React from 'react';
import type { RecognitionState, AIState } from '../../types/ai';
import { Volume2, Trash2, X, Sparkles, Cpu } from 'lucide-react';

interface RecognitionPanelProps {
  recognition: RecognitionState;
  aiState: AIState;
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onSelectSuggestion: (word: string) => void;
  onSpeak: () => void;
  onSimulateLetter?: (char: string) => void;
}

export const RecognitionPanel: React.FC<RecognitionPanelProps> = ({
  recognition,
  aiState,
  isOpen,
  onClose,
  onClear,
  onSelectSuggestion,
  onSpeak,
  onSimulateLetter,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="ai-recognition-panel"
      role="region"
      aria-label="Sign Language Recognition & Contextual Suggestions"
      className="w-full max-w-xl mx-auto bg-surface-900/95 border border-brand-500/40 rounded-xl shadow-xl backdrop-blur-md p-3 sm:p-4 mb-3 transition-all animate-fadeIn text-left"
    >
      {/* Header bar: Model tag, State, Confidence, and Dismiss */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-surface-800 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-950/80 border border-brand-800/70 text-[11px] font-medium text-brand-300">
            <Cpu className="w-3 h-3 text-brand-400 shrink-0" aria-hidden="true" />
            <span className="truncate">SignMate_MobileNetV3Small</span>
          </div>

          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-800 text-surface-300">
            {aiState}
          </span>

          {recognition.confidence > 0 && (
            <span className="text-[11px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40">
              {Math.round(recognition.confidence * 100)}% Conf
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label="Close AI Recognition Panel"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content: Recognized text + suggestions */}
      <div className="space-y-3">
        {/* Recognized Text Display */}
        <div className="flex items-center justify-between gap-3 bg-surface-950/80 border border-surface-800 rounded-lg p-2.5 sm:px-3.5">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider block">
              Recognized:
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-surface-50 break-all">
                {recognition.recognizedText || (
                  <span className="text-surface-500 font-sans text-sm italic font-normal">
                    Sign alphabet to camera...
                  </span>
                )}
              </span>
              {recognition.currentPrediction && (
                <span className="text-xs font-mono font-medium text-brand-300 bg-brand-950/60 px-1.5 py-0.2 rounded border border-brand-800/50">
                  [{recognition.currentPrediction}]
                </span>
              )}
            </div>
          </div>

          {/* Action buttons: Speak and Clear */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onSpeak}
              disabled={!recognition.recognizedText}
              className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Speak recognized text aloud"
              title="Speak recognized text"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!recognition.recognizedText}
              className="p-2 rounded-lg bg-surface-800 hover:bg-rose-900/40 text-surface-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-rose-400 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Clear recognized text"
              title="Clear recognized text"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contextual Suggestions Chips */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-surface-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            <span>Contextual Suggestions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Suggested Words">
            {recognition.suggestions.length > 0 ? (
              recognition.suggestions.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => onSelectSuggestion(word)}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-brand-950/90 hover:bg-brand-900 active:bg-brand-800 text-brand-200 border border-brand-700/60 transition-colors focus-visible:ring-2 focus-visible:ring-brand-400 select-none min-h-touch"
                  aria-label={`Select suggestion ${word}`}
                >
                  [{word}]
                </button>
              ))
            ) : (
              <span className="text-xs text-surface-500 italic">
                Awaiting character sequence for completions...
              </span>
            )}
          </div>
        </div>

        {/* Quick Simulator Tool */}
        {onSimulateLetter && (
          <div className="pt-2 border-t border-surface-800/80 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-[10px] text-surface-400 uppercase font-semibold shrink-0">
              Test Signs:
            </span>
            {['H', 'E', 'L', 'P', 'T', 'H', 'A', 'N', 'K', 'S'].map((char, index) => (
              <button
                key={`${char}-${index}`}
                type="button"
                onClick={() => onSimulateLetter(char)}
                className="px-2 py-1 text-xs font-mono font-bold rounded bg-surface-800 hover:bg-brand-600 hover:text-white text-surface-300 border border-surface-700/60 transition-colors shrink-0"
                title={`Simulate ISL sign "${char}"`}
              >
                {char}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
