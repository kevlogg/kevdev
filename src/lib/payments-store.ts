import fs from 'fs'
import path from 'path'

export interface StoredPayment {
  id: string
  clienteId: string
  date: string
  amount: number
  concept: string
  medioPago: string
  confirmed: boolean
}

const TMP_FILE = path.join('/tmp', 'kevdev_payments_store.json')
let inMemoryStore: StoredPayment[] = []

function loadStore(): StoredPayment[] {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('[PaymentsStore] Error reading tmp store file:', e)
  }
  return inMemoryStore
}

function saveStore(store: StoredPayment[]) {
  inMemoryStore = store
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(store, null, 2), 'utf8')
  } catch (e) {
    console.warn('[PaymentsStore] Error writing tmp store file:', e)
  }
}

export function recordPaymentInStore(payment: StoredPayment) {
  const store = loadStore()
  const normClient = String(payment.clienteId || '').toLowerCase().trim()
  
  const existingIdx = store.findIndex(p => 
    (p.id && payment.id && p.id === payment.id) ||
    (p.date === payment.date && p.amount === payment.amount && String(p.clienteId).toLowerCase().trim() === normClient)
  )

  const newEntry: StoredPayment = {
    id: payment.id || `PAGO-${Date.now()}`,
    clienteId: normClient,
    date: payment.date || new Date().toISOString().split('T')[0],
    amount: Number(payment.amount || 0),
    concept: payment.concept || 'Cuota Mensual',
    medioPago: payment.medioPago || 'Transferencia',
    confirmed: payment.confirmed ?? true,
  }

  if (existingIdx >= 0) {
    store[existingIdx] = newEntry
  } else {
    store.push(newEntry)
  }

  saveStore(store)
}

export function deletePaymentFromStore(date: string, amount: number, clienteId?: string) {
  let store = loadStore()
  const normClient = clienteId ? String(clienteId).toLowerCase().trim() : ''
  store = store.filter(p => {
    const isSameDate = p.date === date
    const isSameAmount = Number(p.amount) === Number(amount)
    if (isSameDate && isSameAmount) {
      if (!normClient) return false
      const pNorm = String(p.clienteId).toLowerCase().trim()
      if (pNorm === normClient || pNorm.includes(normClient) || normClient.includes(pNorm)) return false
    }
    return true
  })
  saveStore(store)
}

export function getPaymentsFromStore(clienteId: string): StoredPayment[] {
  const store = loadStore()
  const normId = String(clienteId || '').toLowerCase().trim()
  const isPajarosQuery = normId.includes('pajaro') || normId.includes('cabeza') || normId.includes('qrkvon')
  const isCalvosQuery = normId.includes('calvo')
  const isDulceHogarQuery = normId.includes('dulce')

  return store.filter(p => {
    const pNorm = String(p.clienteId || '').toLowerCase().trim()
    if (pNorm === normId) return true
    if (isPajarosQuery && (pNorm.includes('pajaro') || pNorm.includes('cabeza') || pNorm.includes('qrkvon') || (!pNorm.includes('calvo') && !pNorm.includes('dulce')))) return true
    if (isCalvosQuery && pNorm.includes('calvo')) return true
    if (isDulceHogarQuery && pNorm.includes('dulce')) return true
    return false
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}
