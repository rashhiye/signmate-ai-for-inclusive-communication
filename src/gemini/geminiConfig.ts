/**
 * Gemini Contextual Suggestion Configuration
 *
 * NOTE: The frontend communicates ONLY with a backend proxy endpoint.
 * The Gemini secret API key resides strictly on the server side.
 */

export interface GeminiProxyConfig {
  proxyUrl: string;
  defaultSuggestionsCount: number;
}

export function getGeminiProxyConfig(): GeminiProxyConfig {
  return {
    proxyUrl: import.meta.env.VITE_GEMINI_PROXY_URL || '/api/gemini/suggest',
    defaultSuggestionsCount: 3,
  };
}
