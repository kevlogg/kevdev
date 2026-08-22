import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildTime123456789',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kevdev.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kevdev',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kevdev.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456789',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
