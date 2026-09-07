import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore'

let adminApp: App

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  'kevdev-1234'
const DEFAULT_CLIENT_EMAIL = 'firebase-adminsdk-fbsvc@kevdev-1234.iam.gserviceaccount.com'
const DEFAULT_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2imD8t/7K35FQ\n8+mrL+RSby9uUgcETCsZMyJt5LgcefzonYujeL0Nu/Gw2hP6HIl6L0eiJHxNNf4r\nJQhkY1mzmvPHB+0/YSxeIlrJniR+S2DKr+qntARMCkYmdhLSP3wBLt46z0QGcQIn\nhT7vWNdGT1I+PDxCA4LhtbFUwmj0kzNPYzwNkHI/fAyvNKxGCnBg5S1Heq1vbXkh\n6Jq3t8aT5wJ+vsQaWdx1bdH5/ooQ73Dwdu69M7k73WOqnUc5069HLoFvUwcANwaq\nK4PCv5vZbchTNKYgQ5il+hl2rFstO6S7G36ytwFshK0Qt1rZSTB4mzmOP7yXtiRv\nlDYjIxhJAgMBAAECggEAK3DmIO52w/gNoKrTbqpwl0+fhY0e315zGUWqiWWXjStY\nzVEE9MvcjgKuw4w6mdilvP64ePVe4Y8aZFElXKKqK8yR/Ek+JEmvYd2iJn4sqCOv\nLr1LxkpYhXIifK+3zfJOxAdP2sYNpczKGvaiYhqN7M0ewPHb00f7o1R2lbnIeX+Q\n+aAvOhFO1++K7Rew+bAG7KEw0fBwwbt5C1qBvGHiJPzZMTR4uZ6zcwkD7uA8nlOy\nGWaSakPHVewdGpN5J8n15UgGPOCA237EzRRl4ljM7ZVPLxwM1+DIr9dXQ7AJqHC4\nHkyLYwYJnTiewis9qsrf+NIH7oCyrAranXIn7B5XyQKBgQDx3NmxvLqIDZjQaUGN\n4I42RczAWMsBwUjZP8paKCZu0Bir6iCazn1IlU63Hv4uyV54Qi05BqODdp3C88UD\n7WY/zbl+JwWUr7gzXXEobbt3M3stOfw/+cEXUdj4E9ttJNi1n9K+aT73y8y0TFFA\nkt+MmZfodL5Cubiz/jBI/Zd3TQKBgQDBNdoxTppNBOpSAMmhotUS4+86M/T7xOv9\n7gaQvqYwJuWmuIETs8mmtv0e0CHwh8wN+e/c6YzPiouANAyNzA90VDkvBvZ/gMh8\nfSdtkF/JLvej+tN4cee2ZJFI/gvGvPdnw+CV0Jb1jrmhQGPGSMzZjtSwWWL+E9Xj\nI3w+6pk+7QKBgQCKZ2ZP9n8LojRDdygjR1A6MIE1xNoO3AuS/pUOOJGdsgmcPzN/\nQxCge4h69ApivasIyF3Wlzz02uj2icbBM5XihxhR34SrDE8tXZiGmRzA3r3rKJZ4\nCbT8YkL1228iqwY0EQxpGBMHfCFdP5rzh9jTPYWXaU8DIgJXRetdqXiGtQKBgQC0\nsVOE53kA7MbjuB7aDrns98SkjzDfQTRff/sd5V7xC3+dI1J8BZliVCJ3bblABRA+\nRfAgjz+EXZLHbGYNOrl9VsNACuf/KIbXfgigu/QI5+brscmSDBzjBDynogeLbvCG\nV7czBSgZMMjEWL63EyCZmq2o23/sFMrkqSwqfyagpQKBgBUYd4LP21iNObw+D/RJ\nx+JVIs2HPVUEkGcMBrtJNffYSx8pqRCNU3+P9XL0TOKBNaP6HB0I8qn1FM2bGay1\nf05YZgUqBsHAo/rCP1eF06612FkGxYmABhcbB7koARG7fhzNl6k0i2+bMglAShl9\n2vGOX8J5gZOMKjD1G6YLMYA6\n-----END PRIVATE KEY-----\n`

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || DEFAULT_CLIENT_EMAIL
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || DEFAULT_PRIVATE_KEY
const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined

if (!getApps().length) {
  if (clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } else {
    adminApp = initializeApp({
      projectId,
    })
  }
} else {
  adminApp = getApps()[0]
}

export const adminDb: Firestore = getFirestore(adminApp)
export { FieldValue }
