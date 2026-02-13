// Copy this file to environment.ts and environment.prod.ts, then fill in your real values.
// NEVER commit environment.ts or environment.prod.ts with real keys to Git.

export const environment = {
  production: false,
  useDevAuth: true,

  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },

  flightApi: {
    url: 'https://us-central1-crm-sdk.cloudfunctions.net/flightInfoChallenge',
    token: 'YOUR_CRM_TOKEN',
    candidate: 'YOUR_NAME',
  },

  aeroDataBox: {
    apiKey: 'YOUR_RAPIDAPI_KEY',
    baseUrl: 'https://aerodatabox.p.rapidapi.com',
    host: 'aerodatabox.p.rapidapi.com',
  },
};
