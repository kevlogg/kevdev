import { NextResponse } from 'next/server'
import { updateCliente, addHistorialPago, getHistorialPagos, getCliente } from '@/lib/firestore'

export const dynamic = 'force-dynamic'

function siteBase(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`
}

export async function POST(req: Request) {
  try {
    const { clienteId } = await req.json()
    if (!clienteId) {
      return NextResponse.json({ error: 'Falta clienteId' }, { status: 400 })
    }

    const cliente = await getCliente(clienteId)
    if (!cliente || !cliente.url) {
      return NextResponse.json({ error: 'El cliente no existe o no tiene URL configurada' }, { status: 400 })
    }

    const baseUrl = siteBase(cliente.url)
    let syncCount = 0
    let configUpdated = false

    try {
      // 1. Fetch config de billing desde la web en producción del cliente
      const cfgRes = await fetch(`${baseUrl}/api/admin/billing`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
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
          await updateCliente(clienteId, updates)
          configUpdated = true
        }
      }
    } catch (e) {
      console.warn(`No se pudo consultar /api/admin/billing en ${baseUrl}:`, e)
    }

    try {
      // 2. Fetch pagos guardados en la web del cliente
      const payRes = await fetch(`${baseUrl}/api/admin/billing/payments`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      })

      if (payRes.ok) {
        const payData = await payRes.json()
        const clientPayments: Array<{ date: string; amount: number; concept?: string; concepto?: string; confirmed: boolean }> = payData.payments || []

        const existingPagos = await getHistorialPagos(clienteId)

        for (const p of clientPayments) {
          const alreadyExists = existingPagos.some(
            ep => ep.fecha === p.date && ep.monto === p.amount && ep.concepto === (p.concept || p.concepto)
          )
          if (!alreadyExists && p.amount > 0) {
            await addHistorialPago({
              clienteId,
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
      message: `Sincronización completada. ${syncCount} pagos nuevos importados.`,
    })
  } catch (error) {
    console.error('Error en /api/admin/sync-client:', error)
    return NextResponse.json({ error: 'Error durante la sincronización' }, { status: 500 })
  }
}
