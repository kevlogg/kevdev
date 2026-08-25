import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const keys = Object.keys(process.env)
  const firebaseKeys = keys.filter(k => k.toLowerCase().includes('firebase') || k.toLowerCase().includes('service') || k.toLowerCase().includes('secret'))
  const envStatus = firebaseKeys.reduce((acc, k) => {
    acc[k] = process.env[k] || 'UNDEFINED'
    return acc
  }, {} as Record<string, string>)

  return NextResponse.json({ envStatus })
}
