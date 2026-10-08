import { useState, useCallback } from 'react';
import type { AIState, RecognitionState } from '../types/ai';
import { announceToScreenReader } from '../utils/a11y';
import { dictionaryService } from '../services/dictionaryService';

export interface UseSignAIResult {
  aiState: AIState;
  isPanelOpen: boolean;
  recognition: RecognitionState;
  toggleAI: () => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  clearRecognized: () => void;
  appendCharacter: (char: string) => void;
  deleteLastCharacter: () => void;
  addSpace: () => void;
  selectSuggestion: (word: string) => void;
  speakRecognizedText: () => void;
  simulateTestDetection: (char: string, confidence?: number) => void;
}

export function useSignAI(): UseSignAIResult {
  const [aiState, setAiState] = useState<AIState>('off');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<RecognitionState>({
    state: 'off',
    recognizedText: '',
    currentPrediction: null,
    confidence: 0,
    suggestions: [],
    error: null,
  });

  const toggleAI = useCallback(() => {
    setAiState((prev) => {
      const next: AIState = prev === 'off' ? 'active' : 'off';
      setRecognition((r) => ({
        ...r,
        state: next,
      }));
      announceToScreenReader(`Sign recognition AI ${next === 'active' ? 'enabled' : 'disabled'}`);
      if (next === 'active') {
        setIsPanelOpen(true);
      }
      return next;
    });
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const setPanelOpen = useCallback((open: boolean) => {
    setIsPanelOpen(open);
  }, []);

  const clearRecognized = useCallback(() => {
    setRecognition((r) => ({
      ...r,
      recognizedText: '',
      currentPrediction: null,
      confidence: 0,
      suggestions: [],
    }));
    announceToScreenReader('Recognized text cleared');
  }, []);

  const appendCharacter = useCallback((char: string) => {
    setRecognition((r) => {
      const nextText = r.recognizedText + char.toUpperCase();
      const words = nextText.split(/\s+/);
      const lastWord = (words[words.length - 1] || '').toUpperCase();

      // Query words starting with this prefix from dictionary_compact.json
      const suggestions = dictionaryService.getWordSuggestions(lastWord, 8);

      return {
        ...r,
        recognizedText: nextText,
        currentPrediction: char.toUpperCase(),
        confidence: 0.97,
        suggestions,
      };
    });
  }, []);

  const selectSuggestion = useCallback((word: string) => {
    setRecognition((r) => {
      const trimmed = r.recognizedText.trimEnd();
      const lastSpaceIndex = trimmed.lastIndexOf(' ');
      const prefix = lastSpaceIndex >= 0 ? trimmed.substring(0, lastSpaceIndex + 1) : '';
      const updated = `${prefix}${word.toUpperCase()} `;

      return {
        ...r,
        recognizedText: updated,
        currentPrediction: null,
        confidence: 0.99,
        suggestions: [],
      };
    });
    announceToScreenReader(`Selected suggestion: ${word}`);
  }, []);

  const speakRecognizedText = useCallback(() => {
    if (!window.speechSynthesis || !recognition.recognizedText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(recognition.recognizedText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    announceToScreenReader(`Speaking: ${recognition.recognizedText}`);
  }, [recognition.recognizedText]);

  const simulateTestDetection = useCallback((char: string, confidence: number = 0.97) => {
    setRecognition((r) => ({
      ...r,
      currentPrediction: char.toUpperCase(),
      confidence,
      recognizedText: (r.recognizedText + char.toUpperCase()).slice(-12),
    }));
  }, []);

  const deleteLastCharacter = useCallback(() => {
    setRecognition((r) => {
      const nextText = r.recognizedText.slice(0, -1);
      const words = nextText.split(/\s+/);
      const lastWord = (words[words.length - 1] || '').toUpperCase();
      const suggestions = lastWord ? dictionaryService.getWordSuggestions(lastWord, 8) : [];
      return {
        ...r,
        recognizedText: nextText,
        currentPrediction: null,
        suggestions,
      };
    });
  }, []);

  const addSpace = useCallback(() => {
    setRecognition((r) => ({
      ...r,
      recognizedText: r.recognizedText ? `${r.recognizedText.trimEnd()} ` : '',
      currentPrediction: null,
      suggestions: [],
    }));
  }, []);

  return {
    aiState,
    isPanelOpen,
    recognition,
    toggleAI,
    togglePanel,
    setPanelOpen,
    clearRecognized,
    appendCharacter,
    deleteLastCharacter,
    addSpace,
    selectSuggestion,
    speakRecognizedText,
    simulateTestDetection,
  };
}
