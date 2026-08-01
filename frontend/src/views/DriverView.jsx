import React, { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign, Upload, MessageCircle } from 'lucide-react';

export default function DriverView({
  drivers,
  recentOrders,
  handleDriverStartRoute,
  visualizeOrderOnMap,
  setOrderToUpload,
  fileInputRef,
  handleFileUpload
}) {
  const [myDriverId, setMyDriverId] = useState('');
  const [myOrders, setMyOrders] = useState([]);
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    autoDetectDriver();
  }, [drivers]);

  useEffect(() => {
    if (myDriverId) {
      filterMyOrders();
    }
  }, [myDriverId, recentOrders]);

  const autoDetectDriver = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data'));

      if (userData && userData.email && drivers.length > 0) {
        const currentDriver = drivers.find(d => d.email === userData.email);

        if (currentDriver) {
          setMyDriverId(currentDriver.id);
          setDriverName(currentDriver.name);
          console.log('Conductor auto-detectado:', currentDriver.name);
        }
      }
    } catch (err) {
      console.error('Error auto-detecting driver:', err);
    }
  };

  const filterMyOrders = () => {
    const filtered = recentOrders.filter(order => {
      const normalizedStatus = order.status ? order.status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';

      const isMyActiveOrder = order.driverId === myDriverId &&
        (normalizedStatus === 'ASIGNADO' || normalizedStatus === 'EN_CAMINO');
      const isPendingOrder = normalizedStatus === 'PENDIENTE';

      return isMyActiveOrder || isPendingOrder;
    });
    setMyOrders(filtered);
  };

  // Si no hay conductor detectado
  if (!myDriverId) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'clamp(40px, 10vw, 60px)'
      }}>
        <Truck size={48} color="#D71920" style={{ marginBottom: '20px' }}/>
        <h2 style={{
          color: '#2C3E50',
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)'
        }}>
          Cargando perfil...
        </h2>
        <p style={{
          color: '#666',
          marginTop: '10px',
          fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
        }}>
          Detectando tu cuenta de conductor
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Header - RESPONSIVE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        <Truck size={28} color="#D71920"/>
        <div>
          <h2 style={{
            margin: 0,
            color: '#2C3E50',
            fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)'
          }}>
            Modo Conductor
          </h2>
          <p style={{
            margin: '5px 0 0 0',
            color: '#666',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
          }}>
            Bienvenido, <b>{driverName}</b>
          </p>
        </div>
      </div>

      {/* Pedidos disponibles */}
      <div style={{ marginTop: '20px' }}>
        {myOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(40px, 8vw, 60px) clamp(15px, 4vw, 20px)',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '2px dashed #ddd'
          }}>
            <MapPin size={40} color="#999" style={{ marginBottom: '15px' }}/>
            <h3 style={{
              color: '#999',
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
            }}>
              No tienes pedidos pendientes
            </h3>
            <p style={{
              color: '#666',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
            }}>
              Cuando haya nuevos pedidos, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 2vw, 15px)'
          }}>
            {myOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                myDriverId={myDriverId}
                handleDriverStartRoute={handleDriverStartRoute}
                visualizeOrderOnMap={visualizeOrderOnMap}
                setOrderToUpload={setOrderToUpload}
                fileInputRef={fileInputRef}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input oculto para subir foto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
}

function OrderCard({ order, myDriverId, handleDriverStartRoute, visualizeOrderOnMap, setOrderToUpload, fileInputRef }) {
  const normalizedStatus = order.status ? order.status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';

  const isMyOrder = order.driverId === myDriverId;
  const isPending = normalizedStatus === 'PENDIENTE';
  const isAssigned = normalizedStatus === 'ASIGNADO' && isMyOrder;
  const isEnRoute = normalizedStatus === 'EN_CAMINO' && isMyOrder;
  const isDelivered = normalizedStatus === 'ENTREGADO';

  const statusConfig = {
    'PENDIENTE': { color: '#f59e0b', bg: '#FEF3C7', text: 'Disponible' },
    'ASIGNADO': { color: '#3b82f6', bg: '#DBEAFE', text: 'Asignado a Ti' },
    'EN_CAMINO': { color: '#8b5cf6', bg: '#E9D5FF', text: 'En Camino' },
    'ENTREGADO': { color: '#16a34a', bg: '#D1FAE5', text: 'Entregado' }
  };

  const status = statusConfig[normalizedStatus] || statusConfig['PENDIENTE'];

  return (
    <div className="info-card" style={{
      borderLeft: `4px solid ${status.color}`,
      marginBottom: 0,
      padding: 'clamp(12px, 3vw, 20px)'
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
            marginBottom: '3px',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            {order.customerName}
          </div>
          <div style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
            fontWeight: '900',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <DollarSign size={20}/> S/ {order.price}
            {order.paymentMethod === 'Yape' && (
              <span style={{
                fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
                background: '#8b5cf6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                YAPE
              </span>
            )}
          </div>
        </div>

        <div style={{
          background: status.bg,
          color: status.color,
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
          fontWeight: 'bold',
          whiteSpace: 'nowrap'
        }}>
          {status.text}
        </div>
      </div>

      {/* Direcciones */}
      <div style={{
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        color: '#555',
        marginBottom: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <MapPin size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }}/>
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              color: '#999',
              fontWeight: 'bold'
            }}>
              RECOJO:
            </span>
            <div style={{ wordBreak: 'break-word' }}>{order.originAddress}</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <MapPin size={16} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }}/>
          <div style={{ minWidth: 0 }}>
            <span style={{
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              color: '#999',
              fontWeight: 'bold'
            }}>
              ENTREGA:
            </span>
            <div style={{ wordBreak: 'break-word' }}>{order.destAddress}</div>
          </div>
        </div>
      </div>

      {/* Botones de acción - RESPONSIVE */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
      }}>

        {/* CASO 1: Pedido PENDIENTE */}
        {isPending && (
          <>
            <ActionButton
              onClick={() => visualizeOrderOnMap(order)}
              bgColor="#2C3E50"
              icon={<MapPin size={16}/>}
              label="Ver Mapa"
            />
            <ActionButton
              onClick={() => handleDriverStartRoute(order)}
              bgColor="#D71920"
              icon={<Truck size={16}/>}
              label="Aceptar"
            />
          </>
        )}

        {/* CASO 2: Pedido ASIGNADO a mí */}
        {isAssigned && (
          <>
            <ActionButton
              onClick={() => visualizeOrderOnMap(order)}
              bgColor="#2C3E50"
              icon={<MapPin size={16}/>}
              label="Ver Mapa"
            />
            <WhatsAppButton orderId={order.id} type="assigned" />
            <ActionButton
              onClick={() => handleDriverStartRoute(order)}
              bgColor="#3b82f6"
              icon={<Truck size={16}/>}
              label="Iniciar Ruta"
            />
          </>
        )}

        {/* CASO 3: Pedido EN_CAMINO (mío) */}
        {isEnRoute && (
          <>
            <ActionButton
              onClick={() => visualizeOrderOnMap(order)}
              bgColor="#2C3E50"
              icon={<MapPin size={16}/>}
              label="Ver Mapa"
            />
            <WhatsAppButton orderId={order.id} type="enroute" />
            <ActionButton
              onClick={() => {
                setOrderToUpload(order.id);
                fileInputRef.current?.click();
              }}
              bgColor="#16a34a"
              icon={<Upload size={16}/>}
              label="Entregar"
            />
          </>
        )}

        {/* CASO 4: Pedido ENTREGADO */}
        {isDelivered && order.proofImage && (
          <a
            href={`http://localhost:3001${order.proofImage}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: 'min(120px, 100%)',
              textDecoration: 'none'
            }}
          >
            <button
              className="btn-primary"
              style={{
                width: '100%',
                background: '#3b82f6',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                padding: 'clamp(10px, 2.5vw, 12px)'
              }}
            >
              Ver Foto de Entrega
            </button>
          </a>
        )}
      </div>
    </div>
  );
}

// Componente de botón de acción reutilizable
function ActionButton({ onClick, bgColor, icon, label }) {
  return (
    <button
      className="btn-primary"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 'min(120px, 100%)',
        background: bgColor,
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        padding: 'clamp(10px, 2.5vw, 12px)',
        gap: '6px'
      }}
    >
      {icon} {label}
    </button>
  );
}

// Botón de WhatsApp para contactar cliente
function WhatsAppButton({ orderId, type }) {
  const handleWhatsApp = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/whatsapp?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        // Si no hay teléfono registrado
        alert('El cliente no tiene teléfono registrado');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al generar enlace de WhatsApp');
    }
  };

  return (
    <button
      className="btn-primary"
      onClick={handleWhatsApp}
      style={{
        flex: 1,
        minWidth: 'min(100px, 100%)',
        background: '#25D366',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        padding: 'clamp(10px, 2.5vw, 12px)',
        gap: '6px'
      }}
    >
      <MessageCircle size={16}/> Cliente
    </button>
  );
}
