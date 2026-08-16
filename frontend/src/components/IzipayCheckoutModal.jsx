import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react';

// Checkout de IZIPAY simulado: no hay credenciales de sandbox todavía, así
// que este modal imita el flujo real (token -> procesar -> confirmar) pero
// contra los endpoints /api/payments/izipay/* del backend, que también
// están simulados (ver backend/izipay.js). Nada de esto llama a IZIPAY de
// verdad. Ver README.md → "Pasarela de pago (IZIPAY)" para activarlo.
export default function IzipayCheckoutModal({ order, onClose, onPaid }) {
  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success' | 'failed'
  const [errorMsg, setErrorMsg] = useState('');

  const runPayment = async (simulateResult) => {
    setStep('processing');
    try {
      const tokenRes = await fetch('http://localhost:3001/api/payments/izipay/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id })
      });
      if (!tokenRes.ok) throw new Error('No se pudo iniciar el pago');
      const { formToken } = await tokenRes.json();

      // Simula el tiempo de procesamiento real de una pasarela de pago
      await new Promise(resolve => setTimeout(resolve, 900));

      const confirmRes = await fetch('http://localhost:3001/api/payments/izipay/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, formToken, simulateResult })
      });
      if (!confirmRes.ok) throw new Error('No se pudo confirmar el pago');
      const result = await confirmRes.json();

      if (result.paymentStatus === 'PAGADO') {
        setStep('success');
        onPaid?.(result.order);
      } else {
        setErrorMsg(result.rawResponse?.message || 'Pago rechazado');
        setStep('failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión con la pasarela de pago');
      setStep('failed');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '100%', maxWidth: '420px', padding: '25px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard color="#182849" size={22} />
            <span style={{ fontWeight: 'bold', color: '#182849' }}>Checkout IZIPAY</span>
          </div>
          <span style={{
            background: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 'bold',
            padding: '3px 8px', borderRadius: '20px'
          }}>
            🧪 MODO SANDBOX (SIMULADO)
          </span>
        </div>

        <div style={{
          background: '#f8f9fa', borderRadius: '10px', padding: '12px 15px', marginBottom: '18px',
          fontSize: '0.85rem', color: '#333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Pedido</span>
            <span>{order.id.slice(0, 8)}...</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: '#16a34a' }}>
            <span>Total a pagar</span>
            <span>S/ {order.price?.toFixed(2)}</span>
          </div>
        </div>

        {step === 'form' && (
          <>
            {/* Campos de tarjeta puramente visuales — no se procesan ni se envían a ningún lado */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>NÚMERO DE TARJETA</label>
              <input disabled placeholder="4242 4242 4242 4242" style={{ marginBottom: 0 }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>VENCIMIENTO</label>
                <input disabled placeholder="12/28" style={{ marginBottom: 0 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>CVV</label>
                <input disabled placeholder="123" style={{ marginBottom: 0 }} />
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '14px' }}>
              Como todavía no hay credenciales reales de IZIPAY, usa uno de estos botones para simular el resultado del pago:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => runPayment('success')}
                style={{
                  background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px',
                  padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                ✅ Simular Pago Exitoso
              </button>
              <button
                onClick={() => runPayment('failure')}
                style={{
                  background: 'white', color: '#dc2626', border: '2px solid #dc2626', borderRadius: '10px',
                  padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                ❌ Simular Pago Rechazado
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'none', color: '#666', border: 'none', padding: '8px',
                  cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader size={32} color="#182849" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', color: '#666', fontSize: '0.9rem' }}>Procesando pago con IZIPAY...</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle size={44} color="#16a34a" />
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#16a34a' }}>¡Pago aprobado!</p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '15px', background: '#16a34a' }}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <XCircle size={44} color="#dc2626" />
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#dc2626' }}>Pago rechazado</p>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{errorMsg}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => setStep('form')} className="btn-primary" style={{ flex: 1 }}>
                Reintentar
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1, background: 'white', color: '#666', border: '1px solid #ddd',
                  borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
