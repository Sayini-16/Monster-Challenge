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
      background: #ffffff;
      border-bottom: 1px solid #e5e5e5;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: rgba(140, 198, 63, 0.12);
      border: 1px solid rgba(140, 198, 63, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #8cc63f;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .brand-name {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.3px;
      color: #222222;
    }

    .brand-highlight {
      color: #8cc63f;
    }

    .brand-sub {
      font-size: 10px;
      color: #888888;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .logout-btn {
      color: #555555 !important;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      padding: 0 16px;
      height: 36px;
      font-size: 13px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      transition: all 0.25s ease;
    }

    .logout-btn:hover {
      background: #f7f7f7 !important;
      border-color: #ccc;
      color: #222222 !important;
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
        font-size: 16px;
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
