export interface ChecklistStep {
  id: number
  texto: string
  etapa: string
}

export const CHECKLIST_STEPS: ChecklistStep[] = [
  { id: 1,  texto: 'Analizar perfil de Instagram del cliente',   etapa: 'Prospección'  },
  { id: 2,  texto: 'Enviar mensaje inicial de contacto',          etapa: 'Prospección'  },
  { id: 3,  texto: 'Confirmar interés del cliente',               etapa: 'Contacto'     },
  { id: 4,  texto: 'Construir demo personalizada',                etapa: 'Demo'         },
  { id: 5,  texto: 'Enviar demo con mensaje profesional',         etapa: 'Demo'         },
  { id: 6,  texto: 'Hacer seguimiento a las 48hs',                etapa: 'Demo'         },
  { id: 7,  texto: 'Presentar plan y presupuesto',                etapa: 'Presupuesto'  },
  { id: 8,  texto: 'Resolver objeciones o dudas',                 etapa: 'Negociación'  },
  { id: 9,  texto: 'Enviar contrato digital',                     etapa: 'Cierre'       },
  { id: 10, texto: 'Confirmar primer pago',                       etapa: 'Cierre'       },
  { id: 11, texto: 'Publicar sitio con dominio',                  etapa: 'Entrega'      },
  { id: 12, texto: 'Dar acceso al panel admin',                   etapa: 'Entrega'      },
  { id: 13, texto: 'Pedir referido o reseña a los 7 días',        etapa: 'Post-venta'   },
]
