/**
 * Input validation utilities
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
}

export function isValidRoomName(name: string): {
  isValid: boolean;
  message?: string;
} {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Room name cannot be empty' };
  }
  if (name.trim().length > 40) {
    return { isValid: false, message: 'Room name cannot exceed 40 characters' };
  }
  return { isValid: true };
}
