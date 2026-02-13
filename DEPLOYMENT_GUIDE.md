# Deployment Guide — Monster Flight

## Security: Understanding Each Key

| Key | Public or Secret? | Why? |
|---|---|---|
| Firebase `apiKey` | **Public** (by design) | Firebase API keys are identifiers, not secrets. Security comes from Firebase Auth + Security Rules, not the key itself. Google's docs explicitly say it's safe to embed in client code. |
| CRM `token` | **Semi-public** | Challenge token they gave you. It'll be in the JS bundle regardless. Acceptable for this use case. |
| AeroDataBox `apiKey` | **Secret** | Personal RapidAPI key tied to your billing. If someone scrapes it from a public GitHub repo, they can burn through your quota or rack up charges. |

### The fundamental problem with frontend apps

Every key you put in a frontend app ends up in the browser's JavaScript bundle. There's no way around this — the browser needs the key to make API calls. The real protections are:

- **Firebase**: Security Rules + Auth (the key is just a project identifier)
- **CRM endpoint**: Their server validates the token
- **AeroDataBox**: The only truly secret key — ideally this would go through a backend proxy, but for a coding challenge, we protect it by keeping it out of the Git repo

### What we did

- `environment.example.ts` — committed to Git with placeholder values (template for other devs)
- `environment.ts` and `environment.prod.ts` — added to `.gitignore`, never committed with real keys

---

## Part 1: Deploy to GitHub

### Step 1: Create a GitHub repo

1. Go to https://github.com/new
2. Name it `monster-flight-challenge`
3. Set to **Public** or **Private** (private is safer for API keys)
4. Do NOT initialize with README (we already have one)
5. Click **Create repository**

### Step 2: Initialize and push

```bash
cd "C:/Users/aniru/Desktop/React/Monster-flight-challenge"

# Initialize git
git init

# Stage everything (environment.ts and environment.prod.ts are gitignored)
git add .

# Verify environment files are NOT staged
git status
# You should NOT see environment.ts or environment.prod.ts
# You SHOULD see environment.example.ts

# Commit
git commit -m "Initial commit: Monster Flight challenge app"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/monster-flight-challenge.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Verify on GitHub

- `environment.example.ts` IS there (with placeholders)
- `environment.ts` and `environment.prod.ts` are NOT there

---

## Part 2: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

Opens a browser for Google OAuth. Sign in with the account that owns your Firebase project.

### Step 3: Set up your Firebase project

1. Go to https://console.firebase.google.com
2. Create a new project called `monster-flight-challenge` (or use existing)
3. **Authentication** → **Sign-in method** → **Email/Password** → **Enable**
4. **Authentication** → **Users** → **Add user** → create your test account (email + password)
5. **Project Settings** (gear icon) → scroll to **Your apps** → click the web icon (`</>`)
6. Register your app → copy the `firebaseConfig` object

### Step 4: Fill in production environment file

Edit `src/app/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  useDevAuth: false,  // MUST be false for production

  firebase: {
    apiKey: 'AIzaSy...',           // from Firebase Console step 6
    authDomain: 'monster-flight-challenge.firebaseapp.com',
    projectId: 'monster-flight-challenge',
    storageBucket: 'monster-flight-challenge.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  },

  flightApi: {
    url: 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge',
    token: 'WW91IG11c3QgYmUgdGhlIGN1cmlvdXMgdHlwZS4gIEJyaW5nIHRoaXMgdXAgYXQgdGhlIGludGVydmlldyBmb3IgYm9udXMgcG9pbnRzICEh',
    candidate: 'Anirudh Sayini',
  },

  aeroDataBox: {
    apiKey: 'your-real-rapidapi-key',
    baseUrl: 'https://aerodatabox.p.rapidapi.com',
    host: 'aerodatabox.p.rapidapi.com',
  },
};
```

Also fill in `src/app/environments/environment.ts` (dev) with the same Firebase config but keep `useDevAuth: true` for local development.

### Step 5: Build for production

```bash
ng build --configuration production
```

This compiles the app with `environment.prod.ts` swapped in (via `fileReplacements` in `angular.json`). Output goes to `dist/monster-flight/browser/`.

### Step 6: Deploy to Firebase

```bash
firebase deploy
```

Firebase CLI reads `firebase.json`, uploads `dist/monster-flight/browser/` to their CDN. You'll get a URL like:

```
https://monster-flight-challenge.web.app
```

### Step 7: Test the deployed app

1. Open the URL from Step 6
2. Login with the test user you created in Step 3.4
3. Fill in a flight form and submit
4. Verify the CRM submission works

---

## Quick Reference: Commands to deploy again after changes

```bash
# Build
ng build --configuration production

# Deploy
firebase deploy
```

---

## What's protected, what's not

```
┌─────────────────────────────────────────────────────┐
│                    Git Repo                          │
│                                                     │
│  environment.example.ts  ← placeholder values only  │
│  environment.ts          ← GITIGNORED (not pushed)  │
│  environment.prod.ts     ← GITIGNORED (not pushed)  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 Deployed App (JS bundle)             │
│                                                     │
│  Firebase API key  ← visible, but safe by design    │
│  CRM token         ← visible, challenge requirement │
│  RapidAPI key      ← visible in bundle, but NOT     │
│                      in your public Git repo         │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Firebase not initialized" error after deploy
- Make sure `useDevAuth: false` in `environment.prod.ts`
- Make sure all Firebase config values are filled in (not placeholder strings)

### Login fails on deployed app
- Verify you created a user in Firebase Console → Authentication → Users
- Check that Email/Password sign-in is enabled in Sign-in methods

### 404 on page refresh
- The `firebase.json` rewrite rule (`"source": "**"` → `/index.html`) handles SPA routing
- If still failing, run `firebase deploy` again to ensure `firebase.json` is uploaded

### Build output location
- Production build goes to: `dist/monster-flight/browser/`
- This matches the `public` field in `firebase.json`
