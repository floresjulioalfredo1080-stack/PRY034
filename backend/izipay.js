// ============ PASARELA DE PAGO IZIPAY (SIMULADA) ============
//
// Este módulo simula el flujo de pago de IZIPAY porque todavía no contamos
// con credenciales de sandbox (merchant code / public key / private key).
// Las dos funciones exportadas tienen la misma forma que tendría una
// integración real, para que activarla más adelante sea: pegar las
// credenciales en .env y reemplazar el cuerpo de estas dos funciones por
// las llamadas reales al SDK/API REST de IZIPAY — el resto del backend
// (endpoints, eventos de socket, guardado en la base de datos) no debería
// necesitar cambios.
//
// Ver README.md → "Pasarela de pago (IZIPAY)" para los pasos de activación.

const IZIPAY_SIMULATE = process.env.IZIPAY_SIMULATE !== 'false'; // true por defecto: no hay credenciales aún

// Simula el paso de "tokenización": en la integración real, el backend
// firma una petición con IZIPAY_PRIVATE_KEY y llama a la API de IZIPAY para
// obtener un formToken, que luego el frontend usa para inicializar el
// checkout embebido (KR-payment-form). La clave privada NUNCA debe viajar
// al frontend.
function createPaymentToken({ orderId, amount }) {
  if (!IZIPAY_SIMULATE) {
    // Aquí iría la llamada real, por ejemplo:
    //
    // const auth = Buffer.from(`${process.env.IZIPAY_PRIVATE_KEY}:`).toString('base64');
    // const response = await fetch('https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment', {
    //   method: 'POST',
    //   headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'PEN', orderId })
    // });
    // return response.json();
    throw new Error('Integración real de IZIPAY no implementada todavía. Ver README.md.');
  }

  return {
    formToken: `SIMULATED-TOKEN-${orderId}-${Date.now()}`,
    merchantCode: process.env.IZIPAY_MERCHANT_CODE || 'SANDBOX_DEMO',
    mode: 'SIMULACION'
  };
}

// Simula el resultado del pago. `simulateResult` ('success' | 'failure')
// solo existe porque esto es una simulación controlada desde el frontend
// para poder probar ambos casos — en la integración real, este resultado
// llegaría de forma asíncrona por el webhook de IZIPAY (ver
// /api/payments/izipay/webhook en index.js), nunca decidido por el cliente.
function confirmPayment({ formToken, simulateResult }) {
  if (!IZIPAY_SIMULATE) {
    throw new Error('Integración real de IZIPAY no implementada todavía. Ver README.md.');
  }

  const success = simulateResult !== 'failure';
  return {
    success,
    transactionId: `SIM-TXN-${Date.now()}`,
    formToken,
    rawResponse: success
      ? { orderStatus: 'PAID', message: 'Pago simulado aprobado' }
      : { orderStatus: 'UNPAID', message: 'Pago simulado rechazado (simulación de fondos insuficientes)' }
  };
}

module.exports = { createPaymentToken, confirmPayment, IZIPAY_SIMULATE };
