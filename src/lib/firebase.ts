import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function cleanEnv(val?: string) {
  return val ? val.trim().replace(/^\uFEFF/, '') : undefined
}

const firebaseConfig = {
  apiKey:            cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || 'AIzaSyAcoTvuqhnDegDQc49z4iH4GL3X0OHB5po',
  authDomain:        cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || 'kevdev-1234.firebaseapp.com',
  projectId:         cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || 'kevdev-1234',
  storageBucket:     cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || 'kevdev-1234.firebasestorage.app',
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || '1003636816468',
  appId:             cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) || '1:1003636816468:web:7a99bfd826471466db0bc1',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)

let authPromise: Promise<any> | null = null

export async function ensureServerAuth() {
  if (auth.currentUser) return
  if (authPromise) return authPromise

  const email = process.env.FIREBASE_ADMIN_EMAIL || 'kevdev.info@gmail.com'
  const password = process.env.FIREBASE_ADMIN_PASSWORD || 'kevdev2026'

  authPromise = (async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      if (e?.code === 'auth/too-many-requests') {
        console.warn('Firebase Auth rate limited, waiting for session or fallback')
      } else {
        try {
          await signInAnonymously(auth)
        } catch (anonErr) {
          console.warn('Firebase Auth fallback failed:', anonErr)
        }
      }
    } finally {
      authPromise = null
    }
  })()

  return authPromise
}
