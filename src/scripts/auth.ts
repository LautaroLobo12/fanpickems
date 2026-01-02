// Authentication logic
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AuthUser } from '../types/index.js';
import { auth, db } from './firebase.js';

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
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp()
      });
    } else {
      // Update existing user document with latest info
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || null
      }, { merge: true });
    }
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