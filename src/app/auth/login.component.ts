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
      background: #f7f7f7;
    }

    /* ── Card ── */
    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 44px 36px 32px;
      animation: cardEnter 0.5s ease-out;
    }

    @keyframes cardEnter {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ── Brand ── */
    .login-brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-ring {
      width: 68px;
      height: 68px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: rgba(140, 198, 63, 0.1);
      border: 1px solid rgba(140, 198, 63, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .login-logo {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #8cc63f !important;
    }

    .login-title {
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: 26px;
      color: #222222;
      margin: 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .login-title .highlight {
      color: #8cc63f;
    }

    .login-subtitle {
      color: #888888;
      font-size: 14px;
      margin: 8px 0 0;
      font-family: 'Open Sans', sans-serif;
    }

    /* ── Fields ── */
    .full-width {
      width: 100%;
    }

    form .full-width {
      margin-bottom: 6px;
    }

    .login-button {
      margin-top: 8px;
      height: 48px;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.5px;
      border-radius: 4px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      border-radius: 4px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #d32f2f;
      font-size: 14px;
    }

    .error-banner mat-icon {
      color: #d32f2f !important;
    }

    .login-footer {
      text-align: center;
      margin: 28px 0 0;
      font-size: 11px;
      color: #aaaaaa;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 32px 20px 24px;
      }

      .login-title {
        font-size: 22px;
      }
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
