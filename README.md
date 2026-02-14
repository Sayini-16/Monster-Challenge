# MonsterFlight - Guest Arrival Details

An Angular application that collects guest flight arrival information and submits it to the Monster Reservations Group CRM system.

## Live Demo

**URL:** [https://monster-flight-challenge.web.app/login](https://monster-flight-challenge.web.app/login)

**Credentials:** provided separately via email.

## Setup

```bash
git clone <repo-url>
cd Monster-flight-challenge
npm install
ng serve
```

Open `http://localhost:4200/`. Environment config lives in `src/app/environments/`.

## Tech Stack

- **Angular 21** with Angular Material 3 (standalone components, signals, lazy loading)
- **Firebase JS SDK 12** for authentication
- **AeroDataBox API** for real-time flight verification
- **Firebase Hosting** for deployment

## Architecture Decisions

**Firebase JS SDK over @angular/fire** — The project only needs Authentication. Direct SDK usage avoids an unnecessary abstraction layer and stays current with Firebase releases.

**Signals over RxJS for UI state** — Signals handle synchronous state (`isLoading`, `submissionState`) with automatic change detection and no cleanup. RxJS is still used for HTTP calls via `firstValueFrom`.

**State machine for submission** — A single typed signal (`'idle' | 'submitting' | 'success' | 'error'`) replaces multiple boolean flags, making impossible states unrepresentable.

**Reactive forms for flight form, template-driven for login** — The flight form needs programmatic value setting (auto-fill from API) and custom validators. The login form has two simple fields where `ngModel` is sufficient.

**Soft flight validation** — The AeroDataBox API is a convenience, not a gate. Users can always submit manually if the API is unavailable or the flight isn't found.
