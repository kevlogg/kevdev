'use client'

import { useState } from 'react'
import { addCliente, type DemoEstado, type Situacion } from '@/lib/firestore'

const EXCEL_DATA: Array<{
  nombre: string
  demo: DemoEstado
  situacion: Situacion
  plan: string
  telefono: string
  url: string
}> = [
  { nombre: 'BOLONIA KIDS',              demo: 'PRESENTADA', situacion: 'NO RESPONDIO',  plan: '',       telefono: '',           url: '' },
  { nombre: 'LOCOS POR LA PINOTEA',      demo: 'PRESENTADA', situacion: 'NO RESPONDIO',  plan: '',       telefono: '',           url: '' },
  { nombre: 'TIENDA DE ASTILLAS',        demo: 'PRESENTADA', situacion: 'EN PRODUCCION', plan: 'Mensual',telefono: '1134198371', url: 'tiendadeastillas.com.ar' },
  { nombre: 'WILLOW JARDINERIA',         demo: 'PRESENTADA', situacion: 'NO RESPONDIO',  plan: '',       telefono: '',           url: '' },
  { nombre: 'GALVI CARPINTERIA',         demo: 'PRESENTADA', situacion: 'RECHAZADA',     plan: '',       telefono: '',           url: '' },
  { nombre: 'BMB NAUTIC',               demo: 'PRESENTADA', situacion: 'RECHAZADA',     plan: '',       telefono: '',           url: '' },
  { nombre: 'VGM METALES',              demo: 'PRESENTADA', situacion: 'NO RESPONDIO',  plan: '',       telefono: '',           url: '' },
  { nombre: 'ANDREA C TEJIDOS',         demo: 'PRESENTADA', situacion: 'EN ESPERA',     plan: '',       telefono: '',           url: '' },
  { nombre: 'CR DECORADORES',           demo: 'PRESENTADA', situacion: 'EN ESPERA',     plan: '',       telefono: '1159657303', url: '' },
  { nombre: 'DV AMOBLAMIENTOS',         demo: 'HECHA',      situacion: '',              plan: '',       telefono: '',           url: '' },
  { nombre: 'ORIMAR CONCEPTO',          demo: 'PRESENTADA', situacion: 'EN ESPERA',     plan: '',       telefono: '',           url: '' },
  { nombre: 'DUPLACK PLACAS ANTI-HUMEDAD', demo: 'PRESENTADA', situacion: 'EN ESPERA',  plan: '',       telefono: '',           url: '' },
  { nombre: 'ONLY HOME SILLONES',       demo: 'HECHA',      situacion: '',              plan: '',       telefono: '',           url: '' },
]

export default function ImportPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [log,    setLog]    = useState<string[]>([])

  async function handleImport() {
    setStatus('running')
    setLog([])
    let ok = 0

    for (const row of EXCEL_DATA) {
      try {
        await addCliente({
          nombre:    row.nombre,
          demo:      row.demo,
          situacion: row.situacion,
          plan:      row.plan,
          telefono:  row.telefono,
          url:       row.url,
          rubro: '', contacto: '', instagram: '',
          estado: 'prospecto',
          notas: '',
        })
        ok++
        setLog(l => [...l, `✓ ${row.nombre}`])
      } catch {
        setLog(l => [...l, `✗ ${row.nombre} — error`])
      }
    }

    setStatus(ok === EXCEL_DATA.length ? 'done' : 'error')
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{
        background: 'var(--color-depth)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
            Importación única
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-star)', margin: 0 }}>
            Importar clientes del Excel
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)', margin: '8px 0 0' }}>
            Carga los {EXCEL_DATA.length} clientes del Excel en Firestore. Ejecutá esto una sola vez.
          </p>
        </div>

        {status === 'idle' && (
          <button
            onClick={handleImport}
            style={{
              background: 'var(--color-accent)', color: 'var(--color-on-accent)',
              border: 'none', borderRadius: 8, padding: '10px 20px',
              fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', fontWeight: 600,
              cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Importar {EXCEL_DATA.length} clientes
          </button>
        )}

        {status === 'running' && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Importando...
          </p>
        )}

        {log.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {log.map((l, i) => (
              <p key={i} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.8125rem',
                color: l.startsWith('✓') ? '#4ade80' : '#f87171',
                margin: 0,
              }}>
                {l}
              </p>
            ))}
          </div>
        )}

        {status === 'done' && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: '#4ade80', fontWeight: 600 }}>
            Importación completa. Podés borrar esta página ahora.
          </p>
        )}
      </div>
    </div>
  )
}
