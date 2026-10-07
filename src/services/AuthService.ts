import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { FirebaseAuthAdapter } from '../firebase/firebaseAuth';

export class ServiceNotImplementedError extends Error {
  constructor(serviceName: string, methodName: string) {
    super(`${serviceName}.${methodName}() is not yet integrated with live backend services.`);
    this.name = 'ServiceNotImplementedError';
  }
}

export interface IAuthService {
  signIn(credentials: LoginCredentials): Promise<User>;
  signUp(credentials: RegisterCredentials): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signInAnonymously(displayName?: string): Promise<User>;
  handleRedirectResult(): Promise<User | null>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * Production AuthService wired to live Firebase Authentication.
 */
export class AuthService implements IAuthService {
  private static instance: AuthService;
  private adapter: IAuthService;

  private constructor() {
    this.adapter = new FirebaseAuthAdapter();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(credentials: LoginCredentials): Promise<User> {
    return this.adapter.signIn(credentials);
  }

  async signUp(credentials: RegisterCredentials): Promise<User> {
    return this.adapter.signUp(credentials);
  }

  async signInWithGoogle(): Promise<User> {
    return this.adapter.signInWithGoogle();
  }

  async signInAnonymously(displayName?: string): Promise<User> {
    return this.adapter.signInAnonymously(displayName);
  }

  async handleRedirectResult(): Promise<User | null> {
    return this.adapter.handleRedirectResult();
  }

  async signOut(): Promise<void> {
    return this.adapter.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.adapter.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.adapter.onAuthStateChanged(callback);
  }
}

export const authService = AuthService.getInstance();

