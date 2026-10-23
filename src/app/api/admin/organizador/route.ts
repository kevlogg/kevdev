import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const docRef = adminDb.collection('admin_organizador').doc('data')
    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ data: null })
    }
    return NextResponse.json({ data: snapshot.data() })
  } catch (error: any) {
    console.error('[Organizador API] Error fetching:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const docRef = adminDb.collection('admin_organizador').doc('data')
    await docRef.set({
      ...body,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (error: any) {
    console.error('[Organizador API] Error saving:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
