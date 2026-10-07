import type { IGeminiService } from '../services/GeminiService';
import type { GeminiPromptContext } from '../types/gemini';
import { getGeminiProxyConfig } from './geminiConfig';

/**
 * Gemini Contextual Suggestions Adapter
 * Provides smart completions for recognized ISL character sequences.
 */
export class GeminiSuggestionsAdapter implements IGeminiService {
  private config = getGeminiProxyConfig();

  async getSuggestions(context: GeminiPromptContext): Promise<string[]> {
    if (!context.recognizedSequence) {
      return [];
    }

    throw new Error(
      `Gemini suggestion proxy (${this.config.proxyUrl}) will be connected in Phase 5.`
    );
  }
}
