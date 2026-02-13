import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    @if (auth.isLoggedIn()) {
      <mat-toolbar class="app-toolbar">
        <div class="brand">
          <div class="brand-icon-wrap">
            <mat-icon class="brand-icon">flight_takeoff</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-name">Monster<span class="brand-highlight">Flight</span></span>
            <span class="brand-sub">Reservations Group</span>
          </div>
        </div>
        <span class="spacer"></span>
        <button mat-button class="logout-btn" (click)="onLogout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </mat-toolbar>
    }
    <main class="app-content" [class.fade-in]="auth.isAuthReady()">
      <router-outlet />
    </main>
  `,
  styles: `
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0 24px;
      height: 64px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(0, 200, 83, 0.2), rgba(0, 200, 83, 0.05));
      border: 1px solid rgba(0, 200, 83, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #00c853;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-name {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.5px;
      color: #ffffff;
    }

    .brand-highlight {
      color: #00c853;
    }

    .brand-sub {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 400;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .logout-btn {
      color: rgba(255, 255, 255, 0.7) !important;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 0 16px;
      height: 38px;
      font-size: 13px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      border-color: rgba(255, 255, 255, 0.25);
      color: #ffffff !important;
    }

    .app-content {
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .app-content.fade-in {
      opacity: 1;
    }

    @media (max-width: 480px) {
      .app-toolbar {
        padding: 0 12px;
      }

      .brand-sub {
        display: none;
      }

      .brand-name {
        font-size: 18px;
      }
    }
  `,
})
export class App {
  constructor(
    protected auth: AuthService,
    private router: Router,
  ) { }

  async onLogout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
