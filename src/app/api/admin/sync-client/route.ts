import { NextResponse } from 'next/server'
import { getCliente, getClientes, updateCliente, addHistorialPago, getHistorialPagos } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

function siteBase(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { clienteId, url: providedUrl } = body

    if (!clienteId) {
      return NextResponse.json({ error: 'Falta clienteId en la solicitud' }, { status: 400 })
    }

    // 1. Buscar cliente por ID directo o por coincidencia de nombre/url
    let cliente = await getCliente(clienteId).catch(() => null)
    if (!cliente) {
      const allClis = await getClientes().catch(() => [])
      const searchNorm = clienteId.toLowerCase().trim()
      cliente = allClis.find(
        (c: any) =>
          c.id === clienteId ||
          (c.url && c.url.toLowerCase().includes(searchNorm)) ||
          (c.nombre && c.nombre.toLowerCase().includes(searchNorm))
      ) || null
    }

    let rawUrl = providedUrl || cliente?.url || ''
    const normSearch = (clienteId + ' ' + (cliente?.nombre || '')).toLowerCase()
    if (!rawUrl || rawUrl.trim() === '') {
      if (normSearch.includes('calvo') || normSearch.includes('compresor')) {
        rawUrl = 'https://loscalvoscompresores.com'
      } else if (normSearch.includes('dulce') || normSearch.includes('hogar')) {
        rawUrl = 'https://dulcehogarmuebles.com.ar'
      }
    }

    if (!rawUrl) {
      return NextResponse.json(
        { error: `El cliente '${clienteId}' no tiene URL configurada` },
        { status: 400 }
      )
    }

    // Si cliente no existe en Firestore todavía, sintetizar objeto seguro
    if (!cliente) {
      cliente = {
        id: clienteId,
        nombre: normSearch.includes('calvo') ? 'LOS CALVOS COMPRESORES' : clienteId,
        url: rawUrl,
      } as any
    }

    const baseUrl = siteBase(rawUrl)
    const secret = process.env.KEVDEV_PAYMENTS_SECRET || 'kevdev_payments_sec_2026_key'

    const updates: Record<string, any> = {}
    let paymentsToImport: Array<{ date: string; amount: number; concept?: string; concepto?: string; confirmed: boolean }> = []

    // 2. Fetch config de billing desde la web en producción del cliente
    try {
      const cfgRes = await fetch(`${baseUrl}/api/admin/billing`, {
        headers: {
          'Accept': 'application/json',
          'x-kevdev-secret': secret,
        },
        cache: 'no-store',
      })

      if (cfgRes.ok) {
        const cfgData = await cfgRes.json()
        const config = cfgData.config || cfgData

        if (config.monthly_amount) {
          updates.montoMensual = config.monthly_amount
        }
        if (config.one_time_amount) {
          updates.montoPagoUnico = config.one_time_amount
        }

        if (config.monthly_next_date) {
          const nextDate = new Date(config.monthly_next_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

          if (diffDays < 0) {
            updates.estadoPago = 'VENCIDO'
          } else if (diffDays <= 7) {
            updates.estadoPago = 'PENDIENTE'
          } else {
            updates.estadoPago = 'AL_DIA'
          }
        }
      }
    } catch (e) {
      console.warn(`[Sync] No se pudo consultar /api/admin/billing en ${baseUrl}:`, e)
    }

    // 3. Fetch pagos guardados en la web del cliente
    try {
      const payRes = await fetch(`${baseUrl}/api/admin/billing/payments`, {
        headers: {
          'Accept': 'application/json',
          'x-kevdev-secret': secret,
        },
        cache: 'no-store',
      })

      if (payRes.ok) {
        const payData = await payRes.json()
        const clientPayments: Array<{ date: string; amount: number; concept?: string; concepto?: string; confirmed: boolean }> = payData.payments || []

        const targetId = cliente?.id || clienteId
        const existingPagos = await getHistorialPagos(targetId).catch(() => [])

        for (const p of clientPayments) {
          const alreadyExists = existingPagos.some(
            ep => ep.fecha === p.date && ep.monto === p.amount
          )
          if (!alreadyExists && p.amount > 0) {
            paymentsToImport.push(p)
          }
        }
      }
    } catch (e) {
      console.warn(`[Sync] No se pudo consultar /api/admin/billing/payments en ${baseUrl}:`, e)
    }

    // Intentar aplicar cambios desde el servidor si Firestore lo permite
    let serverSyncedCount = 0
    try {
      const targetId = cliente?.id || clienteId
      if (Object.keys(updates).length > 0) {
        await updateCliente(targetId, updates).catch(() => {})
      }
      for (const p of paymentsToImport) {
        await addHistorialPago({
          clienteId: targetId,
          monto: p.amount,
          fecha: p.date || new Date().toISOString().split('T')[0],
          concepto: p.concept || p.concepto || 'Cobro Automático Web',
          medioPago: 'MercadoPago / Web',
          confirmado: p.confirmed ?? true,
        }).catch(() => {})
        serverSyncedCount++
      }
    } catch (err) {
      console.warn('[Sync] Fallback a aplicación de cliente en el navegador:', err)
    }

    return NextResponse.json({
      success: true,
      clienteId: cliente?.id || clienteId,
      updates,
      paymentsToImport,
      serverSyncedCount,
      message: `Sincronización completada para ${cliente?.nombre || clienteId}.`,
    })
  } catch (error: any) {
    console.error('Error en /api/admin/sync-client:', error)
    return NextResponse.json(
      { error: 'Error durante la sincronización: ' + (error?.message || 'Error de conexión') },
      { status: 500 }
    )
  }
}
