import { NextResponse } from 'next/server'
import { updateCliente, addHistorialPago, getHistorialPagos, getCliente } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

function siteBase(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { clienteId } = body

    if (!clienteId) {
      return NextResponse.json({ error: 'Falta clienteId en la solicitud' }, { status: 400 })
    }

    // 1. Buscar cliente en Firestore (por ID directo o por coincidencia en URL/nombre)
    let cliente = await getCliente(clienteId)
    if (!cliente) {
      const { getClientes } = require('@/lib/firestore')
      const allClis = await getClientes()
      const searchNorm = clienteId.toLowerCase()
      cliente = allClis.find(
        (c: any) =>
          c.id === clienteId ||
          (c.url && c.url.toLowerCase().includes(searchNorm)) ||
          (c.nombre && c.nombre.toLowerCase().includes(searchNorm))
      ) || null
    }

    if (!cliente || !cliente.url) {
      return NextResponse.json(
        { error: `El cliente '${clienteId}' no existe o no tiene URL configurada` },
        { status: 400 }
      )
    }

    const baseUrl = siteBase(cliente.url)
    const secret = process.env.KEVDEV_PAYMENTS_SECRET || 'kevdev_payments_sec_2026_key'
    let syncCount = 0
    let configUpdated = false

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

        const updates: Record<string, any> = {}
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

        if (Object.keys(updates).length > 0) {
          await updateCliente(cliente.id || clienteId, updates)
          configUpdated = true
        }
      }
    } catch (e) {
      console.warn(`No se pudo consultar /api/admin/billing en ${baseUrl}:`, e)
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

        const targetId = cliente.id || clienteId
        const existingPagos = await getHistorialPagos(targetId)

        for (const p of clientPayments) {
          const alreadyExists = existingPagos.some(
            ep => ep.fecha === p.date && ep.monto === p.amount
          )
          if (!alreadyExists && p.amount > 0) {
            await addHistorialPago({
              clienteId: targetId,
              monto: p.amount,
              fecha: p.date || new Date().toISOString().split('T')[0],
              concepto: p.concept || p.concepto || 'Cobro Automático Web',
              medioPago: 'MercadoPago / Web',
              confirmado: p.confirmed ?? true,
            })
            syncCount++
          }
        }
      }
    } catch (e) {
      console.warn(`No se pudo consultar /api/admin/billing/payments en ${baseUrl}:`, e)
    }

    return NextResponse.json({
      success: true,
      configUpdated,
      syncedPayments: syncCount,
      message: `Sincronización completada para ${cliente.nombre}. ${syncCount} pagos importados.`,
    })
  } catch (error: any) {
    console.error('Error en /api/admin/sync-client:', error)
    return NextResponse.json(
      { error: 'Error durante la sincronización: ' + (error?.message || 'Error interno') },
      { status: 500 }
    )
  }
}
