import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="login-container">
      <!-- Floating orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <mat-card class="login-card">
        <div class="login-brand">
          <div class="logo-ring">
            <mat-icon class="login-logo">flight_takeoff</mat-icon>
          </div>
          <h1 class="login-title">Monster<span class="highlight">Flight</span></h1>
          <p class="login-subtitle">Sign in to submit your flight details</p>
        </div>

        <mat-card-content>
          @if (errorMessage()) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                email
                placeholder="you@example.com"
                [disabled]="isLoading()"
              />
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                placeholder="Enter your password"
                [disabled]="isLoading()"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-button"
              [disabled]="isLoading() || !loginForm.valid"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="login-footer">Monster Reservations Group</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
      position: relative;
      overflow: hidden;
    }

    /* ── Floating Orbs ── */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      z-index: -1;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      background: rgba(0, 200, 83, 0.12);
      top: -100px;
      right: -100px;
      animation: float1 15s ease-in-out infinite;
    }

    .orb-2 {
      width: 300px;
      height: 300px;
      background: rgba(0, 100, 255, 0.08);
      bottom: -50px;
      left: -50px;
      animation: float2 18s ease-in-out infinite;
    }

    .orb-3 {
      width: 200px;
      height: 200px;
      background: rgba(255, 213, 79, 0.06);
      top: 50%;
      left: 60%;
      animation: float3 12s ease-in-out infinite;
    }

    @keyframes float1 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-60px, 40px); }
    }

    @keyframes float2 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(40px, -50px); }
    }

    @keyframes float3 {
      0%, 100% { transform: translate(0, 0); }
      50% { transform: translate(-30px, -30px); }
    }

    /* ── Card ── */
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 44px 36px 32px;
      animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* ── Brand ── */
    .login-brand {
      text-align: center;
      margin-bottom: 36px;
    }

    .logo-ring {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(0, 200, 83, 0.15), rgba(0, 200, 83, 0.03));
      border: 1px solid rgba(0, 200, 83, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.1); }
      50% { box-shadow: 0 0 24px 4px rgba(0, 200, 83, 0.12); }
    }

    .login-logo {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #00c853 !important;
    }

    .login-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 28px;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .login-title .highlight {
      color: #00c853;
    }

    .login-subtitle {
      color: rgba(255, 255, 255, 0.45);
      font-size: 14px;
      margin: 8px 0 0;
    }

    /* ── Fields ── */
    .full-width {
      width: 100%;
    }

    .login-button {
      margin-top: 8px;
      height: 50px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      border-radius: 10px;
      background: rgba(198, 40, 40, 0.12);
      border: 1px solid rgba(198, 40, 40, 0.2);
      color: #ef5350;
      font-size: 14px;
    }

    .login-footer {
      text-align: center;
      margin: 24px 0 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.25);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  async onLogin(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/flight-form']);
    } catch (error: unknown) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const code = (error as { code?: string }).code;
      switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'Invalid email or password.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Check your connection.';
        default:
          return 'Login failed. Please try again.';
      }
    }
    return 'An unexpected error occurred.';
  }
}
