/**
 * ZEGOCLOUD Integration Configuration
 *
 * Architecture:
 * SignMate Room ID (e.g. SM-952JW) -> ZEGOCLOUD Conference Room ID
 * Maximum participants: 3-5 participants
 *
 * SECURITY NOTICE:
 * Never put ZEGOCLOUD ServerSecret in frontend code.
 * Room tokens must be minted by the secure backend or serverless function.
 */

export interface ZegoConfig {
  appId: number;
  tokenServerUrl?: string;
}

export function getZegoConfig(): ZegoConfig | null {
  const appIdRaw = import.meta.env.VITE_ZEGO_APP_ID;
  if (!appIdRaw) return null;

  const appId = parseInt(appIdRaw, 10);
  if (isNaN(appId) || appId <= 0) return null;

  return {
    appId,
    tokenServerUrl: import.meta.env.VITE_ZEGO_TOKEN_SERVER_URL,
  };
}

export function isZegoConfigured(): boolean {
  return getZegoConfig() !== null;
}
