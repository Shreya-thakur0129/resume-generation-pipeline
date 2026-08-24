import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';

let app: FirebaseApp | null = null;
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Scopes required for Google Sheets and Google Drive File access
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  try {
    const configModule = await import('../../firebase-applet-config.json');
    const firebaseConfig = configModule.default || configModule;
    if (firebaseConfig && firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
      return app;
    }
  } catch (err) {
    console.warn('[OAuth] firebase-applet-config.json not loaded, falling back to manual config if available:', err);
  }
  return null;
}

export const initAuth = async (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }

  const auth = getAuth(firebaseApp);
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might need re-acquisition or popup on demand
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) {
    throw new Error('Firebase configuration is missing or invalid.');
  }

  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  for (const scope of SCOPES) {
    provider.addScope(scope);
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      console.info('[OAuth] Sign-in popup was closed or cancelled by user.');
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      console.warn('[OAuth] Sign-in popup was blocked by browser permissions.');
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups or open in a new tab.');
    }
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setManualAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  const firebaseApp = await getFirebaseApp();
  if (firebaseApp) {
    const auth = getAuth(firebaseApp);
    await signOut(auth);
  }
  cachedAccessToken = null;
};
