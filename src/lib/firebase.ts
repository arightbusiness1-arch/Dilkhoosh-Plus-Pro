import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { AppState } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Support both Vite environment variables (e.g. Netlify/Vercel/GitHub Actions) and local JSON config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId
};

const customDatabaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

// Initialize Firebase App instance safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID if provided in config or env
export const db = customDatabaseId 
  ? getFirestore(app, customDatabaseId)
  : getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Auth and Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Upload a file/blob to Google Firebase Storage and return its public download URL
 */
export async function uploadFileToStorage(
  storagePath: string, 
  fileOrBlob: Blob | Uint8Array | ArrayBuffer
): Promise<string> {
  try {
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, fileOrBlob);
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error) {
    console.error('Firebase Storage Upload Error:', error);
    throw error;
  }
}

/**
 * Trigger Google Sign In popup using Firebase Auth
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Auth Sign-In Error:", error);
    throw error;
  }
}

/**
 * Sign out Google Auth session
 */
export async function logoutGoogleAuth(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Google Auth Sign-Out Error:", error);
  }
}

// Connection test as required by Firebase skill
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
      return false;
    }
    // Any other response confirms connectivity to Firebase endpoints
    return true;
  }
}

const APP_STATE_COLLECTION = 'app_state';
const APP_STATE_DOC = 'current';

/**
 * Deeply sanitizes an object for Firestore by converting any undefined values to null or removing them,
 * preventing "Unsupported field value: undefined" errors.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Save complete application state to Firebase Firestore
 */
export async function syncStateToCloud(state: AppState): Promise<boolean> {
  if (!state) return false;
  try {
    const stateDocRef = doc(db, APP_STATE_COLLECTION, APP_STATE_DOC);
    
    // Clean and serialize state for Firestore
    const rawPayload = {
      staffList: state.staffList || [],
      attendanceRecords: state.attendanceRecords || [],
      directives: state.directives || [],
      tasks: state.tasks || [],
      settings: state.settings || {},
      hubData: state.hubData || { instructions: [], reminders: [], emergencies: [], ideas: [] },
      recycleBin: state.recycleBin || [],
      lastUpdated: new Date().toISOString(),
      updatedBy: state.currentUserId || 'admin'
    };

    const sanitizedPayload = sanitizeForFirestore(rawPayload);

    await setDoc(stateDocRef, sanitizedPayload, { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to sync state to Firebase Firestore:', error);
    return false;
  }
}

/**
 * Load application state from Firebase Firestore
 */
export async function fetchStateFromCloud(): Promise<Partial<AppState> | null> {
  try {
    const stateDocRef = doc(db, APP_STATE_COLLECTION, APP_STATE_DOC);
    const snap = await getDoc(stateDocRef);
    
    if (snap.exists()) {
      const data = snap.data();
      return {
        staffList: data.staffList,
        attendanceRecords: data.attendanceRecords,
        directives: data.directives,
        tasks: data.tasks,
        settings: data.settings,
        hubData: data.hubData,
        recycleBin: data.recycleBin
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch state from Firebase Firestore:', error);
    return null;
  }
}

/**
 * Subscribe to real-time updates from Firebase Firestore
 */
export function subscribeToCloudUpdates(
  onData: (cloudState: Partial<AppState>) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const stateDocRef = doc(db, APP_STATE_COLLECTION, APP_STATE_DOC);
    return onSnapshot(
      stateDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onData({
            staffList: data.staffList,
            attendanceRecords: data.attendanceRecords,
            directives: data.directives,
            tasks: data.tasks,
            settings: data.settings,
            hubData: data.hubData,
            recycleBin: data.recycleBin
          });
        }
      },
      (err) => {
        console.warn('Firestore real-time subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (e) {
    console.error('Error setting up cloud listener:', e);
    return () => {};
  }
}
