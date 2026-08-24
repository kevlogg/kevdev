# 💳 Guía de Integración de Pagos KevDev

Esta guía explica cómo conectar los proyectos de tus clientes con **KevDev** para que cada vez que reciban un pago (MercadoPago, Stripe, Transferencia o formulario) se notifique, valide y guarde de forma automática en el panel de KevDev.

---

## 🔐 1. Puerta de Entrada (API Endpoint)

* **URL:** `https://tu-dominio-kevdev.vercel.app/api/payments/receive`
* **Método HTTP:** `POST`
* **Encabezado de Seguridad (Requerido):** `x-kevdev-secret: <TU_CLAVE_SECRETA>` (o `Authorization: Bearer <TU_CLAVE_SECRETA>`)

---

## 📦 2. Estructura del Mensaje (Payload JSON)

```json
{
  "clienteId": "dulce-hogar", 
  "monto": 35000,
  "concepto": "Mantenimiento Web Mensual - Agosto",
  "fecha": "2026-08-24",
  "medioPago": "MercadoPago",
  "metodo": "pasarela",
  "referencia": "MP-9876543210",
  "confirmado": true
}
```

### Descripción de Campos:
* `clienteId` *(Requerido)*: ID del cliente en KevDev, o el dominio URL (`dulcehogar.com.ar`) o su nombre.
* `monto` *(Requerido)*: Valor numérico del pago.
* `concepto` *(Opcional)*: Detalle del cobro (ej. "Cuota Mensual", "Orden #150").
* `fecha` *(Opcional)*: Fecha en formato `YYYY-MM-DD`. Si se omite, se usa la fecha actual.
* `medioPago` *(Opcional)*: `MercadoPago`, `Stripe`, `Transferencia`, `Efectivo`, etc.
* `metodo` *(Opcional)*: `pasarela` o `manual`.
* `referencia` *(Opcional)*: ID de transacción original.

---

## 🚀 3. Ejemplos de Integración

### Opción A: JavaScript / TypeScript (Node.js / Next.js)

Usa la plantilla ubicada en `src/lib/templates/client-payment-webhook.ts`:

```typescript
import { sendPaymentToKevDev } from './client-payment-webhook'

await sendPaymentToKevDev({
  clienteId: 'dulcehogar.com.ar',
  monto: 25000,
  concepto: 'Renovación de Plan Web',
  medioPago: 'MercadoPago',
  metodo: 'pasarela',
  referencia: 'MP-123456789',
  confirmado: true,
})
```

### Opción B: cURL / HTTP Directo

```bash
curl -X POST https://tu-dominio-kevdev.vercel.app/api/payments/receive \
  -H "Content-Type: application/json" \
  -H "x-kevdev-secret: kevdev_payments_sec_2026_key" \
  -d '{
    "clienteId": "dulce-hogar",
    "monto": 25000,
    "concepto": "Pago Prueba cURL",
    "medioPago": "MercadoPago",
    "referencia": "MP-TEST-001"
  }'
```

---

## 📊 4. Visualización en KevDev

Una vez recibido el webhook:
1. **Métricas Globales (`/admin/estadisticas`)**: Se suma automáticamente a "Cobrado Mes Actual" y a "Historial Acumulado Global".
2. **Ficha del Cliente (`/admin/clientes/[id]`)**: Aparecerá en la tabla de Historial de Pagos etiquetado con la insignia `⚡ Pasarela` y su ID de referencia.
