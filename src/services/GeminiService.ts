import type { GeminiPromptContext } from '../types/gemini';
import { ServiceNotImplementedError } from './AuthService';

export interface IGeminiService {
  getSuggestions(context: GeminiPromptContext): Promise<string[]>;
}

/**
 * Base GeminiService abstraction.
 * Prepared for secure backend proxy integration for contextual word/phrase suggestions.
 * Note: Gemini is NOT the recognition engine; it assists with contextual completions.
 * The browser never contains Gemini API keys.
 */
export class GeminiService implements IGeminiService {
  private static instance: GeminiService;

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async getSuggestions(_context: GeminiPromptContext): Promise<string[]> {
    throw new ServiceNotImplementedError('GeminiService', 'getSuggestions');
  }
}

export const geminiService = GeminiService.getInstance();
