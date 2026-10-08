/**
 * SignMate Room Code Utilities
 * Room code format: SM-XXXXXX (e.g. SM-952JW, SM-7L2C6, X8LN7A)
 */

const ROOM_CODE_REGEX = /^(SM-)?[A-Z0-9]{3,12}$/;
const ALPHANUMERIC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid ambiguous chars 0, 1, O, I

/**
 * Generates a standard SignMate room code
 * Default format: SM-XXXXX (e.g. SM-952JW)
 */
export function generateRoomCode(length: number = 5): string {
  let result = '';
  const charactersLength = ALPHANUMERIC_CHARS.length;
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC_CHARS.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `SM-${result}`;
}

/**
 * Validates whether a string matches or contains a valid SignMate room code
 */
export function isValidRoomCode(code: string): boolean {
  if (!code) return false;
  if (code.includes('/room/')) {
    const match = code.match(/\/room\/([A-Za-z0-9_-]+)/);
    return !!match && match[1].length >= 3;
  }
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return ROOM_CODE_REGEX.test(normalized) && normalized.length >= 3;
}

/**
 * Normalizes user input or URL into a canonical room code
 */
export function normalizeRoomCode(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/room\/([A-Za-z0-9_-]+)/);
  if (urlMatch) {
    const extracted = urlMatch[1].toUpperCase().split('?')[0];
    return extracted.startsWith('SM-') ? extracted : `SM-${extracted}`;
  }

  const clean = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (clean.startsWith('SM-')) {
    return clean;
  }
  if (clean.startsWith('SM')) {
    return `SM-${clean.slice(2)}`;
  }
  return `SM-${clean}`;
}

/**
 * Formats user input into standard SignMate room code structure
 * e.g., "952jw" -> "SM-952JW", "sm-952jw" -> "SM-952JW", pastes URL -> extracted code
 */
export function formatRoomCodeInput(input: string): string {
  if (!input) return '';
  if (input.includes('http://') || input.includes('https://') || input.includes('/room/')) {
    const match = input.match(/\/room\/([A-Za-z0-9_-]+)/);
    if (match) {
      const code = match[1].toUpperCase().split('?')[0];
      return code.startsWith('SM-') ? code : `SM-${code}`;
    }
  }

  let cleaned = input.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  if (cleaned.startsWith('SM-')) {
    const body = cleaned.slice(3).replace(/-/g, '').slice(0, 10);
    return `SM-${body}`;
  } else if (cleaned.startsWith('SM')) {
    const body = cleaned.slice(2).replace(/-/g, '').slice(0, 10);
    return body ? `SM-${body}` : 'SM-';
  } else {
    const body = cleaned.replace(/-/g, '').slice(0, 10);
    return body ? `SM-${body}` : '';
  }
}

/**
 * Extracts raw identifier without the SM- prefix
 */
export function extractRawRoomId(code: string): string {
  return code.replace(/^SM-/, '').trim().toUpperCase();
}
