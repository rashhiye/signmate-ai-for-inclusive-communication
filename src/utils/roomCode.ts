/**
 * SignMate Room Code Utilities
 * Room code format: SM-XXXXXX (e.g. SM-952JW)
 */

const ROOM_CODE_REGEX = /^SM-[A-Z0-9]{5,6}$/;
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
 * Validates whether a string matches the required SignMate room code format
 */
export function isValidRoomCode(code: string): boolean {
  if (!code) return false;
  const normalized = code.trim().toUpperCase();
  return ROOM_CODE_REGEX.test(normalized);
}

/**
 * Formats user input into standard SignMate room code structure
 * e.g., "952jw" -> "SM-952JW", "sm-952jw" -> "SM-952JW"
 */
export function formatRoomCodeInput(input: string): string {
  if (!input) return '';
  let cleaned = input.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  // If user hasn't typed SM- prefix, or typed it partially
  if (cleaned.startsWith('SM-')) {
    const body = cleaned.slice(3).replace(/-/g, '').slice(0, 6);
    return `SM-${body}`;
  } else if (cleaned.startsWith('SM')) {
    const body = cleaned.slice(2).replace(/-/g, '').slice(0, 6);
    return body ? `SM-${body}` : 'SM-';
  } else {
    const body = cleaned.replace(/-/g, '').slice(0, 6);
    return body ? `SM-${body}` : '';
  }
}

/**
 * Extracts raw identifier without the SM- prefix
 */
export function extractRawRoomId(code: string): string {
  return code.replace(/^SM-/, '').trim().toUpperCase();
}
