import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock, DollarSign, CheckCircle, AlertCircle, Navigation, FileText, MessageCircle, XCircle } from 'lucide-react';

export default function ClientHistoryView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data'));

      if (!userData || !userData.id) {
        const response = await fetch('http://localhost:3001/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.slice(0, 10));
        }
      } else {
        const response = await fetch(`http://localhost:3001/api/users/${userData.id}/orders`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      const response = await fetch('http://localhost:3001/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'clamp(40px, 10vw, 60px)',
        color: '#999'
      }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <span style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
          Cargando historial...
        </span>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      padding: 'clamp(12px, 3vw, 20px)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Header - RESPONSIVE */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={28} color="#D71920"/>
          <h2 style={{
            color: '#2C3E50',
            margin: 0,
            fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)'
          }}>
            Historial de Pedidos
          </h2>
        </div>
        <button
          onClick={() => navigate('/client')}
          style={{
            background: '#D71920',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#D71920'}
        >
          <Package size={16} /> Nuevo Envío
        </button>
      </div>
      <p style={{
        color: '#666',
        marginBottom: 'clamp(20px, 4vw, 30px)',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
      }}>
        Revisa todos tus envíos anteriores
      </p>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'clamp(40px, 10vw, 60px) clamp(15px, 4vw, 20px)',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <Package size={40} color="#999" style={{ marginBottom: '15px' }}/>
          <h3 style={{
            color: '#999',
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
          }}>
            No hay pedidos aún
          </h3>
          <p style={{
            color: '#666',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
          }}>
            Cuando realices tu primer envío, aparecerá aquí.
          </p>
          <button
            onClick={() => navigate('/client')}
            className="btn-primary"
            style={{ marginTop: '15px', width: 'auto', padding: '10px 20px' }}
          >
            Crear mi primer envío
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 2vw, 15px)'
        }}>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onCancelSuccess={fetchMyOrders} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onCancelSuccess }) {
  const navigate = useNavigate();

  const normalizedStatus = order.status ? order.status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';

  const statusConfig = {
    'PENDIENTE': { color: '#f59e0b', bg: '#FEF3C7', icon: <AlertCircle size={16}/> },
    'ASIGNADO': { color: '#3b82f6', bg: '#DBEAFE', icon: <Package size={16}/> },
    'EN_CAMINO': { color: '#8b5cf6', bg: '#E9D5FF', icon: <Navigation size={16}/> },
    'ENTREGADO': { color: '#16a34a', bg: '#D1FAE5', icon: <CheckCircle size={16}/> },
    'CANCELADO': { color: '#dc2626', bg: '#FEE2E2', icon: <XCircle size={16}/> }
  };

  const displayNames = {
    'PENDIENTE': 'Pendiente',
    'ASIGNADO': 'Asignado',
    'EN_CAMINO': 'En Camino',
    'ENTREGADO': 'Entregado',
    'CANCELADO': 'Cancelado'
  };

  const status = statusConfig[normalizedStatus] || statusConfig['PENDIENTE'];
  const isDelivered = normalizedStatus === 'ENTREGADO';

  const handleTrack = () => {
    navigate(`/tracking?id=${order.id}`);
  };

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que deseas cancelar este pedido?")) return;
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELADO' })
      });
      if (response.ok) {
        alert("✅ Pedido cancelado exitosamente");
        if (onCancelSuccess) onCancelSuccess();
      } else {
        alert("❌ Error al cancelar el pedido");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al cancelar el pedido");
    }
  };

  return (
    <div className="info-card" style={{
      borderLeft: `4px solid ${status.color}`,
      padding: 'clamp(12px, 3vw, 20px)',
      marginBottom: 0,
      transition: 'all 0.2s'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <div style={{
            fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
            color: '#999',
            marginBottom: '5px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '0.5px'
          }}>
            ID: {order.id.slice(0, 8)}
          </div>
          <div style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.4rem)',
            fontWeight: '900',
            color: '#16a34a'
          }}>
            S/ {order.price}
          </div>
        </div>

        <div style={{
          background: status.bg,
          color: status.color,
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap'
        }}>
          {status.icon}
          {displayNames[normalizedStatus] || order.status}
        </div>
      </div>

      {/* Direcciones */}
      <div style={{
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        color: '#555',
        marginBottom: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <MapPin size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }}/>
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              color: '#999',
              fontWeight: 'bold'
            }}>
              ORIGEN:
            </span>
            <div style={{ wordBreak: 'break-word' }}>{order.originAddress}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <MapPin size={16} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }}/>
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              color: '#999',
              fontWeight: 'bold'
            }}>
              DESTINO:
            </span>
            <div style={{ wordBreak: 'break-word' }}>{order.destAddress}</div>
          </div>
        </div>
      </div>

      {/* Info adicional */}
      <div style={{
        display: 'flex',
        gap: 'clamp(12px, 3vw, 20px)',
        paddingTop: '15px',
        borderTop: '1px solid #f0f0f0',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: '#666',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Package size={14}/>
          <span>{order.packageSize || 'Mediano'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <DollarSign size={14}/>
          <span>{order.paymentMethod || 'Efectivo'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Clock size={14}/>
          <span>{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
        </div>
      </div>

      {/* Botones de acción - RESPONSIVE */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '15px',
        flexWrap: 'wrap'
      }}>
        {/* Botón Rastrear - Solo si NO está entregado */}
        {!isDelivered && (
          <button
            onClick={handleTrack}
            style={{
              flex: 1,
              minWidth: 'min(140px, 100%)',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(15px, 3vw, 20px)',
              background: '#D71920',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#b5161c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#D71920'}
          >
            <Navigation size={16}/> Rastrear
          </button>
        )}

        {/* Foto de entrega si existe */}
        {order.proofImage && (
          <a
            href={`http://localhost:3001${order.proofImage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: 'min(140px, 100%)',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(15px, 3vw, 20px)',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#16a34a',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dcfce7'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdf4'}
          >
            <CheckCircle size={16}/> Ver Foto
          </a>
        )}

        {/* Botón Descargar Comprobante - Solo si está ENTREGADO */}
        {isDelivered && (
          <a
            href={`http://localhost:3001/api/orders/${order.id}/invoice?type=boleta`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: 'min(140px, 100%)',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(15px, 3vw, 20px)',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              color: '#1E40AF',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#DBEAFE'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#EFF6FF'}
          >
            <FileText size={16}/> Comprobante
          </a>
        )}

        {/* Botón WhatsApp - Compartir estado */}
        <button
          onClick={() => {
            const statusLabel = displayNames[normalizedStatus] || order.status;
            const message = `📦 *Mi Pedido URBSEND*\n\n🔖 Estado: *${statusLabel}*\n📍 Origen: ${order.originAddress}\n🎯 Destino: ${order.destAddress}\n💰 Precio: S/ ${order.price}\n📅 Fecha: ${new Date(order.createdAt).toLocaleDateString('es-ES')}\n\n📍 Rastrear:\nhttp://localhost:5173/tracking?id=${order.id}`;
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
          }}
          style={{
            flex: 1,
            minWidth: 'min(140px, 100%)',
            padding: 'clamp(10px, 2.5vw, 12px) clamp(15px, 3vw, 20px)',
            background: '#25D366',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#128C7E'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#25D366'}
        >
          <MessageCircle size={16}/> Compartir
        </button>

        {/* Botón Cancelar - Solo si NO está entregado ni cancelado */}
        {normalizedStatus !== 'ENTREGADO' && normalizedStatus !== 'CANCELADO' && (
          <button
            onClick={handleCancel}
            style={{
              flex: 1,
              minWidth: 'min(140px, 100%)',
              padding: 'clamp(10px, 2.5vw, 12px) clamp(15px, 3vw, 20px)',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
          >
            <XCircle size={16}/> Cancelar Pedido
          </button>
        )}
      </div>
    </div>
  );
}
