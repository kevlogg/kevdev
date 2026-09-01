import { adminDb, FieldValue } from '@/lib/firebase-admin'

export interface OrderRecordInput {
  paymentId: string
  customerEmail: string
  amountPaid: number
  hasOrderBump: boolean
  product?: string
  paymentMethod?: string
  externalReference?: string
}

export async function checkOrderExists(paymentId: string): Promise<boolean> {
  const docRef = adminDb.collection('orders').doc(paymentId)
  const snapshot = await docRef.get()
  return snapshot.exists
}

export async function createOrderRecord(input: OrderRecordInput): Promise<void> {
  const orderDocRef = adminDb.collection('orders').doc(input.paymentId)
  await orderDocRef.set({
    transactionId: input.paymentId,
    email: input.customerEmail,
    amount: input.amountPaid,
    hasOrderBump: input.hasOrderBump,
    product: input.product || 'whatsapp-ai-closer',
    status: 'approved',
    paymentMethod: input.paymentMethod || 'mercadopago',
    externalReference: input.externalReference || '',
    createdAt: FieldValue.serverTimestamp(),
  })
}
