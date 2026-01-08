// Authentication logic
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AuthUser } from '../types/index.js';
import { auth, db } from './firebase.js';
import { maybeUpdateUserPoints } from './services/points.js';

// Auth result types
interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface LogoutResult {
  success: boolean;
  error?: string;
}

// Google OAuth provider
const googleProvider = new GoogleAuthProvider();

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence);

/**
 * Sign in with Google OAuth
 */
export const loginWithGoogle = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create or update user document in Firestore
    await createOrUpdateUser(user);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown login error'
    };
  }
};

/**
 * Sign in with Discord OAuth (Redirect Flow)
 */
export const loginWithDiscord = async (): Promise<void> => {
  const clientId = import.meta.env.PUBLIC_DISCORD_CLIENT_ID;
  const region = import.meta.env.PUBLIC_FIREBASE_REGION || 'us-central1';
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;
  const redirectUri = encodeURIComponent(`https://${region}-${projectId}.cloudfunctions.net/discordAuthRedirect`);
  const scope = encodeURIComponent('identify email');

  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  window.location.href = discordAuthUrl;
};

/**
 * Handle custom token login if present in URL hash
 */
export const handleTokenInUrl = async (): Promise<AuthResult | null> => {
  const hash = window.location.hash;
  if (hash.startsWith('#token=')) {
    const token = hash.replace('#token=', '');
    // Clean up URL
    history.replaceState(null, '', window.location.pathname + window.location.search);

    try {
      const result = await signInWithCustomToken(auth, token);
      const user = result.user;

      await createOrUpdateUser(user);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      console.error('Custom token sign-in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sign-in error'
      };
    }
  }
  return null;
};

/**
 * Sign out current user
 */
export const logout = async (): Promise<LogoutResult> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown logout error'
    };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

/**
 * Create or update user document in Firestore
 */
const createOrUpdateUser = async (user: FirebaseUser): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const publicUserRef = doc(db, 'publicUserProfiles', user.uid);
    const userDoc = await getDoc(userRef);

    let createdAt;

    if (!userDoc.exists()) {
      createdAt = serverTimestamp();
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        createdAt
      });
    } else {
      // Update existing user document with latest info
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null
      }, { merge: true });

      createdAt = userDoc.data()?.createdAt || serverTimestamp();
    }

    // Always update public profile (excluding email for privacy)
    await setDoc(publicUserRef, {
      uid: user.uid,
      displayName: user.displayName || 'Unknown User',
      createdAt
    }, { merge: true });

  } catch (error) {
    console.error('Error creating/updating user:', error);
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid: string): Promise<any | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Wait for authentication to initialize
 */
export const waitForAuth = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Global listener to trigger points calculation when user logs in or refreshes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // This will check if conditions are met and update points if necessary
    maybeUpdateUserPoints(user.uid);
  }
});