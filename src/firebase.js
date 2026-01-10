// Firebase configuration
// Replace these values with your actual Firebase project credentials
// Get these from: Firebase Console > Project Settings > General > Your apps > SDK setup and configuration

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAYcvjX5dctujoSrtVSuqg_ZnysSHmSeP8",
    authDomain: "prompt-sanitizer-antigravity.firebaseapp.com",
    projectId: "prompt-sanitizer-antigravity",
    storageBucket: "prompt-sanitizer-antigravity.firebasestorage.app",
    messagingSenderId: "306505697452",
    appId: "1:306505697452:web:61ea5283fcfbbbc5c3b709"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
