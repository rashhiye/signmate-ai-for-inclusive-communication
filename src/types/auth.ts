export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export type AuthErrorCode =
  | 'AUTH_INVALID_EMAIL'
  | 'AUTH_WRONG_PASSWORD'
  | 'AUTH_USER_NOT_FOUND'
  | 'AUTH_EMAIL_IN_USE'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_NETWORK_ERROR'
  | 'AUTH_NOT_IMPLEMENTED'
  | 'AUTH_UNKNOWN';
