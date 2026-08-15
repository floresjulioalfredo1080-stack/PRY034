import React from 'react';

// Etapas reales del pedido en URBSEND. No incluye "en aduana" ni "última milla"
// como pasos separados porque el sistema no distingue esos sub-estados: todo
// lo que pasa mientras el conductor está en la calle cae bajo EN_CAMINO.
const STAGES = [
  { key: 'PENDIENTE', label: 'Pedido Recibido', icon: '🧾', message: 'Buscando un conductor disponible cerca del punto de recojo.' },
  { key: 'ASIGNADO', label: 'Conductor Asignado', icon: '📦', message: 'Un conductor fue asignado y va en camino a recoger tu pedido.' },
  { key: 'EN_CAMINO', label: 'En Camino', icon: '🚚', message: 'Tu conductor está en camino hacia el destino.' },
  { key: 'ENTREGADO', label: 'Entregado', icon: '✅', message: 'Tu pedido fue entregado con éxito.' },
];

function formatStageDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export default function OrderTimeline({ order }) {
  const normalizedStatus = order.status ? order.status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';

  if (normalizedStatus === 'CANCELADO') {
    return (
      <div style={{
        textAlign: 'center', padding: '16px', background: '#fef2f2',
        borderRadius: '10px', color: '#991b1b', fontWeight: 'bold', marginBottom: '15px'
      }}>
        ❌ Este pedido fue cancelado
      </div>
    );
  }

  const currentIndex = STAGES.findIndex(s => s.key === normalizedStatus);
  const history = order.statusHistory || [];
  const currentStage = STAGES[currentIndex] || STAGES[0];

  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {STAGES.map((stage, index) => {
          const isCompleted = currentIndex >= 0 && index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === STAGES.length - 1;
          const historyEntry = history.find(h => h.status === stage.key);
          const timestamp = formatStageDate(historyEntry?.createdAt);

          const circleColor = isCompleted ? '#16a34a' : isActive ? '#D71920' : '#e5e7eb';
          const circleTextColor = (isCompleted || isActive) ? 'white' : '#9ca3af';

          return (
            <div key={stage.key} style={{ display: 'flex', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: circleColor, color: circleTextColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', flexShrink: 0,
                  boxShadow: isActive ? '0 0 0 4px rgba(215, 25, 32, 0.15)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {isCompleted ? '✔' : stage.icon}
                </div>
                {!isLast && (
                  <div style={{
                    width: '3px', flex: 1, minHeight: '26px',
                    background: isCompleted ? '#16a34a' : '#e5e7eb',
                    transition: 'background 0.3s'
                  }} />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : '20px' }}>
                <div style={{
                  fontWeight: isActive ? 'bold' : '600',
                  color: isActive ? '#D71920' : isCompleted ? '#166534' : '#9ca3af',
                  fontSize: '0.9rem'
                }}>
                  {stage.label}
                </div>
                {timestamp ? (
                  <div style={{ fontSize: '0.72rem', color: '#999', marginTop: '2px' }}>
                    {timestamp}
                  </div>
                ) : isActive ? (
                  <div style={{ fontSize: '0.72rem', color: '#D71920', marginTop: '2px', fontWeight: 'bold' }}>
                    En curso ahora
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{
        marginTop: '10px', fontSize: '0.85rem', color: '#555',
        background: '#f8f9fa', padding: '10px 12px', borderRadius: '8px'
      }}>
        {currentStage.message}
      </p>
    </div>
  );
}
