import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  Auth,
  User,
} from 'firebase/auth';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;

  private currentUser = signal<User | null>(null);
  private authReady = signal(false);
  private devAuthenticated = signal(false);

  readonly isLoggedIn = computed(() =>
    environment.useDevAuth ? this.devAuthenticated() : this.currentUser() !== null
  );
  readonly isAuthReady = computed(() => this.authReady());
  readonly user = computed(() => this.currentUser());

  constructor() {
    if (environment.useDevAuth) {
      this.authReady.set(true);
      return;
    }

    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);

    // Listen for auth state changes (handles page refreshes, token expiry)
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.authReady.set(true);
    });
  }

  async login(email: string, password: string): Promise<void> {
    if (environment.useDevAuth) {
      // Accept any non-empty credentials in dev mode
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      this.devAuthenticated.set(true);
      return;
    }

    await signInWithEmailAndPassword(this.auth!, email, password);
  }

  async logout(): Promise<void> {
    if (environment.useDevAuth) {
      this.devAuthenticated.set(false);
      return;
    }

    await signOut(this.auth!);
  }
}
