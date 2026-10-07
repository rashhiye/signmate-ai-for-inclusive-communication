export interface ContextualSuggestion {
  word: string;
  confidence?: number;
  explanation?: string;
}

export interface GeminiPromptContext {
  recognizedSequence: string;
  previousWords?: string[];
  maxSuggestions?: number;
}
