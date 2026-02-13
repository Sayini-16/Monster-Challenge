# Monster Flight - Guest Arrival Details

A flight information form that sends guest arrival details to a hotel/resort CRM system. Built with Angular 21, Angular Material 3, and Firebase.

## Live Demo

**Deployed URL:** `https://YOUR_PROJECT.web.app`

**Test Credentials:**
- Email: *(provided separately)*
- Password: *(provided separately)*

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.4 | Application framework |
| Angular Material | 21.1.4 | UI component library (Material 3) |
| TypeScript | 5.8+ | Type safety |
| Firebase JS SDK | 12.9.0 | Authentication (email/password) |
| Firebase Hosting | - | Deployment |
| AviationStack API | - | Flight number verification |

## Setup Instructions

### Prerequisites
- Node.js 20 LTS (or compatible)
- npm 10+
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
git clone <repo-url>
cd Monster-flight-challenge
npm install
```

### Configuration

1. **Firebase:** Update `src/app/environments/environment.ts` with your Firebase project credentials:
   ```typescript
   firebase: {
     apiKey: 'your-api-key',
     authDomain: 'your-project.firebaseapp.com',
     projectId: 'your-project-id',
     // ...
   }
   ```

2. **AviationStack:** Add your API key in the same environment file:
   ```typescript
   aviationStack: {
     apiKey: 'your-aviationstack-key',
     // ...
   }
   ```

3. **Firebase project:** Update `.firebaserc` with your Firebase project ID.

### Development

```bash
ng serve
```
Navigate to `http://localhost:4200/`.

### Build & Deploy

```bash
ng build --configuration production
firebase deploy
```

## Architecture Decisions

### Why Firebase JS SDK instead of @angular/fire?
Direct SDK usage avoids the abstraction layer of `@angular/fire`, giving full control over initialization. The `@angular/fire` wrapper can lag behind Firebase SDK releases and adds an unnecessary dependency for a project that only needs Authentication.

### Why standalone components (no NgModules)?
Angular 21 defaults to standalone components. Each component declares its own imports, making dependencies explicit and enabling automatic tree-shaking. There's no `AppModule` or shared module to manage.

### Why signals instead of RxJS for UI state?
Signals are Angular's reactive primitive for synchronous state. They automatically participate in change detection (no `async` pipe needed), don't require cleanup/unsubscribe, and are simpler than BehaviorSubjects for cases like `isLoading`, `errorMessage`, and auth state. RxJS is still used where it fits — Angular's HttpClient returns Observables, and we convert to Promises with `firstValueFrom` for one-shot requests.

### Why reactive forms for the flight form but template-driven for login?
- **Login (template-driven):** Two fields, no programmatic manipulation. `ngModel` is simpler.
- **Flight form (reactive):** Six fields, custom validators, programmatic value setting (auto-fill airline from API), complex validation rules. Reactive forms provide `FormBuilder`, custom validators, and `setValue()`/`patchValue()`.

### Why a state machine for submission state?
Instead of separate `isLoading`, `isSuccess`, `hasError` booleans (which can conflict), a single `submissionState` signal with values `'idle' | 'submitting' | 'success' | 'error'` makes impossible states unrepresentable.

### Why soft validation for flight numbers?
The AviationStack API is a convenience, not a requirement. Users might have valid flights that aren't in the API database, the API might be down, or the free tier might be exhausted. Blocking submission on an external API failure would create a bad user experience.

### Lazy loading
Both the login page and flight form are lazy-loaded via `loadComponent()`. An unauthenticated user never downloads the flight form code, reducing initial bundle size.

## Project Structure

```
src/app/
├── auth/
│   ├── login.component.ts    # Login page with Firebase email/password auth
│   ├── auth.service.ts       # Firebase Auth wrapper using signals
│   └── auth.guard.ts         # Functional route guard (CanActivateFn)
├── flight-form/
│   ├── flight-form.component.ts  # Main form with reactive forms + validation
│   └── flight.service.ts         # HTTP service for CRM API submission
├── services/
│   └── flight-validation.service.ts  # AviationStack flight verification
├── models/
│   └── flight-info.ts        # TypeScript interfaces for API payloads
├── environments/
│   ├── environment.ts        # Dev configuration
│   └── environment.prod.ts   # Production configuration
├── app.ts                    # Root component with toolbar + router outlet
├── app.config.ts             # Application providers (router, HTTP, Material)
└── app.routes.ts             # Route definitions with lazy loading + guards
```

## Validation Rules

| Field | Rules |
|---|---|
| Flight Number | Required, 2-10 characters |
| Airline | Required, min 2 characters |
| Arrival Date | Required, must be today or future |
| Arrival Time | Required |
| Number of Guests | Required, min 1, whole numbers only |
| Comments | Optional |

## API Integration

### CRM Endpoint
- **URL:** `https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge`
- **Method:** POST
- **Headers:** `token`, `candidate`

### AviationStack (soft validation)
- Triggered on flight number blur or via "Verify Flight" button
- If found: auto-fills airline name, shows green checkmark
- If not found: shows warning, allows manual entry
- If API fails: degrades gracefully, no blocking
