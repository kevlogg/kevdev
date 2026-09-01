import { adminDb, FieldValue } from '@/lib/firebase-admin'

export interface UserPurchaseInput {
  email: string
  product: string
  hasOrderBump: boolean
  transactionId: string
  amount: number
}

export async function updateUserPurchaseHistory(input: UserPurchaseInput): Promise<void> {
  if (!input.email) return

  const userDocRef = adminDb.collection('users').doc(input.email)
  await userDocRef.set(
    {
      email: input.email,
      updatedAt: FieldValue.serverTimestamp(),
      purchases: FieldValue.arrayUnion({
        product: input.product,
        hasOrderBump: input.hasOrderBump,
        transactionId: input.transactionId,
        amount: input.amount,
        purchasedAt: new Date().toISOString(),
      }),
    },
    { merge: true }
  )
}
